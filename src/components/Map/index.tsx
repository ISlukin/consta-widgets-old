import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

import russiaHigh from '@amcharts/amcharts4-geodata/russiaCrimeaHigh'
import russiaLow from '@amcharts/amcharts4-geodata/russiaCrimeaLow'
import worldHigh from '@amcharts/amcharts4-geodata/worldHigh'
import worldLow from '@amcharts/amcharts4-geodata/worldLow'
import worldUltra from '@amcharts/amcharts4-geodata/worldUltra'
import useComponentSize from '@rehooks/component-size'
import classnames from 'classnames'
import * as d3 from 'd3'
import { ExtendedFeature, ExtendedFeatureCollection } from 'd3'

import { Tooltip } from '@/components/Tooltip'

import css from './index.css'
import { ruNames } from './ru-geo-names'

type ExtendedFeatureOrCollection = ExtendedFeature | ExtendedFeatureCollection

export type GeoObjectLocation = {
  id: string
  type: 'location'
  geoData: ExtendedFeature
  parentId: string
}

export type GeoObject =
  | {
      id: string
      type: 'country' | 'region'
      geoData: ExtendedFeatureOrCollection
    }
  | GeoObjectLocation

type Coords = readonly [number, number]

export type GeoPoint = {
  id: string
  parentId: string
  coords: Coords
  name: string
}

type CommonCircleParams = {
  x: number
  y: number
  linePath?: string
}

type ObjectCircle = CommonCircleParams & {
  object: GeoObject
  count: number
}

type PointCircle = CommonCircleParams & {
  point: GeoPoint
}

type Props = {
  locations: readonly GeoObjectLocation[]
  points: readonly GeoPoint[]
}

type Zoom = {
  scale: number
  translateX: number
  translateY: number
}

const CENTERING_PADDING = 30
const SPB_COORDS = [30.311515, 59.942568] as const
const ZOOM_HIGH_THRESHOLD = 3000

const featureToObject = (type: 'country' | 'region') => (feature: ExtendedFeature): GeoObject => ({
  type,
  id: String(feature.id),
  geoData: feature,
})

export const getObjectName = (object: GeoObject | undefined): string | undefined => {
  if (!object) {
    return
  }

  const ruName = ruNames[object.id]
  if (ruName) {
    return ruName
  }

  if ('properties' in object.geoData && object.geoData.properties) {
    return object.geoData.properties.name
  }
}

const getMaps = (
  isZooming: boolean,
  scale?: number
): readonly [ExtendedFeatureCollection, ExtendedFeatureCollection] => {
  if (isZooming) {
    return [worldLow, russiaLow]
  }

  if (scale && scale > ZOOM_HIGH_THRESHOLD) {
    return [worldUltra, russiaHigh]
  }

  return [worldHigh, russiaLow]
}

export const getVisibleObjects = (
  objects: readonly GeoObject[],
  selectedObject: GeoObject | undefined
) => {
  return objects.filter(o => {
    if (!selectedObject) {
      return ['country', 'region'].includes(o.type)
    }

    switch (selectedObject.type) {
      case 'country':
        return (
          ['country', 'region'].includes(o.type) ||
          // Области выбранной страны
          (o.type === 'location' && o.parentId === selectedObject.id)
        )
      case 'region':
        return (
          o.type === 'region' ||
          // Области выбранного региона
          (o.type === 'location' && o.parentId === selectedObject.id)
        )
      case 'location':
        return (
          o.id === selectedObject.parentId ||
          // Области в том же регионе, что и выбранная
          (o.type === 'location' && o.parentId === selectedObject.parentId)
        )
    }
  })
}

const getLinePath = (geoPath: d3.GeoPath, coords1: Coords, coords2: Coords) => {
  return (
    geoPath({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[...coords1], [...coords2]],
      },
      properties: {},
    }) || undefined
  )
}

const isPointCircle = (circle: PointCircle | ObjectCircle): circle is PointCircle =>
  'point' in circle

export const Map: React.FC<Props> = ({ locations, points }) => {
  const ref = useRef(null)
  const { width, height } = useComponentSize(ref)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredObjectId, setHoveredObjectId] = useState<string>()
  const [selectedObjectId, setSelectedObjectId] = useState<string>()
  const [zoom, setZoom] = useState<Zoom | undefined>()
  const [isZooming, setIsZooming] = useState(false)

  const [world, russia] = getMaps(isZooming, zoom && zoom.scale)
  const worldWithoutRussia = useMemo(
    () => ({
      ...world,
      features: world.features.filter(f => f.id !== 'RU'),
    }),
    [world]
  )

  const isClickable = (object: GeoObject): boolean =>
    object.id !== selectedObjectId &&
    (object.type === 'location' || locations.some(loc => loc.parentId === object.id))

  const getProjection = useCallback(() => {
    return d3
      .geoMercator()
      .fitSize([width, height], world)
      .clipExtent([[0, 0], [width, height]])
      .rotate([-90, 0])
  }, [width, height])

  const projection = useMemo(() => {
    const p = getProjection()

    if (zoom) {
      p.scale(zoom.scale).translate([zoom.translateX, zoom.translateY])
    }

    return p
  }, [getProjection, zoom])

  const geoPath = useMemo(() => d3.geoPath(projection), [projection])

  const allObjects = useMemo(() => {
    return [
      ...worldWithoutRussia.features.map(featureToObject('country')),
      {
        type: 'country',
        id: 'RU',
        geoData: russia,
      },
      ...russia.features.map(featureToObject('region')),
      ...locations,
    ] as const
  }, [worldWithoutRussia, russia, locations])

  const hoveredObject = allObjects.find(o => o.id === hoveredObjectId)
  const hoveredObjectName = getObjectName(hoveredObject)
  const selectedObject = allObjects.find(o => o.id === selectedObjectId)

  const visibleObjects = useMemo(() => getVisibleObjects(allObjects, selectedObject), [
    allObjects,
    selectedObject,
  ])

  const paths: ReadonlyArray<{
    object: GeoObject
    d?: string
    className?: string
  }> = useMemo(() => {
    return visibleObjects.map(object => ({
      object,
      d: geoPath(object.geoData) || undefined,
      className: object.id === 'RU' ? css.russia : undefined,
    }))
  }, [visibleObjects, geoPath])

  const objectsWithCircles = selectedObjectId
    ? locations.filter(loc => loc.parentId === selectedObjectId)
    : visibleObjects.filter(isClickable)

  const objectCircles: readonly ObjectCircle[] = objectsWithCircles.map(object => {
    const coords = d3.geoCentroid(object.geoData as ExtendedFeature)
    const [x, y] = projection(coords) || [0, 0]
    const count =
      object.type === 'location'
        ? points.filter(p => p.parentId === object.id).length
        : allObjects.filter(o => o.type === 'location' && o.parentId === object.id).length

    return {
      object,
      count,
      x,
      y,
      linePath: getLinePath(geoPath, SPB_COORDS, coords),
    }
  })

  const pointCircles: readonly PointCircle[] = points
    .filter(point => (selectedObject ? point.parentId === selectedObject.id : false))
    .map(point => {
      const [x, y] = projection([point.coords[0], point.coords[1]]) || [0, 0]

      return {
        point,
        x,
        y,
        linePath: getLinePath(geoPath, SPB_COORDS, point.coords),
      }
    })

  const allCircles = [...objectCircles, ...pointCircles] as const

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  const getObjectMouseHandlers = (object: GeoObject) => {
    if (isClickable(object)) {
      return {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          setSelectedObjectId(object.id)
          setHoveredObjectId(undefined)
        },
        onMouseEnter: () => setHoveredObjectId(object.id),
        onMouseLeave: () => setHoveredObjectId(undefined),
      }
    }

    if (selectedObjectId === object.id) {
      return {
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }
    }

    return undefined
  }

  // Анимация зума
  useLayoutEffect(() => {
    if (!width || !height) {
      return
    }

    const featureToZoomOn = selectedObject
      ? selectedObject.geoData
      : {
          type: 'FeatureCollection',
          features: visibleObjects.filter(isClickable).map(o => o.geoData),
        }
    const targetProjection = getProjection().fitExtent(
      [
        [CENTERING_PADDING, CENTERING_PADDING],
        [width - CENTERING_PADDING, height - CENTERING_PADDING],
      ],
      featureToZoomOn as ExtendedFeature
    )
    const [targetTrX, targetTrY] = targetProjection.translate()
    const targetZoom = {
      scale: targetProjection.scale(),
      translateX: targetTrX,
      translateY: targetTrY,
    }

    if (zoom) {
      d3.select(ref.current)
        .transition()
        .duration(1000)
        .tween('mapZoomTween', () => {
          const initialZoom = { ...zoom }
          const i = d3.interpolateObject(initialZoom, targetZoom)

          return (t: number) => {
            setZoom({ ...i(t) })
          }
        })
        .on('start', () => {
          setIsZooming(true)
        })
        .on('end', () => {
          setIsZooming(false)
        })
    } else {
      // При первом рендере не анимируем
      setZoom(targetZoom)
    }
  }, [
    // Тут нельзя делать зависимость от selectedObject, т.к. его изменения зацикливают событие зума
    // (во время зума снижается детализация мира и из-за этого обновляется геометрия selectedObject, хотя selectedObjectId остаётся тем же)
    selectedObjectId,
    getProjection,
  ])

  return (
    <div ref={ref} className={css.main}>
      {width && height && (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={css.svg}
          onMouseMove={handleMouseMove}
          onClick={() => setSelectedObjectId(undefined)}
        >
          {paths.map(item => (
            <path
              key={item.object.id}
              d={item.d}
              className={classnames(
                css.item,
                item.className,
                item.object.id === hoveredObjectId && css.isHovered,
                item.object.id === selectedObjectId && css.isSelected,
                isClickable(item.object) && css.isClickable
              )}
              {...getObjectMouseHandlers(item.object)}
            />
          ))}

          {/* Все линии идут до кругов, чтобы линии всегда были под кругами */}
          {allCircles.map((circle, idx) => (
            <path key={idx} d={circle.linePath} className={css.line} />
          ))}

          {allCircles.map((circle, idx) => {
            const { x, y } = circle
            const handlers = isPointCircle(circle)
              ? { onClick: (e: React.MouseEvent) => e.stopPropagation() }
              : getObjectMouseHandlers(circle.object)

            return (
              <React.Fragment key={idx}>
                <circle cx={x} cy={y} r={10} className={css.circle} {...handlers} />
                <text
                  className={css.circleText}
                  x={x}
                  y={y}
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {isPointCircle(circle) ? circle.point.name : String(circle.count)}
                </text>
              </React.Fragment>
            )
          })}
        </svg>
      )}

      {hoveredObjectName && (
        <Tooltip isVisible direction="top" x={mousePosition.x} y={mousePosition.y}>
          {hoveredObjectName}
        </Tooltip>
      )}
    </div>
  )
}
