import React from 'react'

import classnames from 'classnames'
import * as _ from 'lodash'

import { HoveredMainValue, Line, ScaleLinear } from '../..'

import css from './index.css'

export type Function = (newValue: HoveredMainValue) => void

type Props = {
  lines: readonly Line[]
  width: number
  height: number
  isVertical: boolean
  scaleX: ScaleLinear
  scaleY: ScaleLinear
  onChangeHoveredMainValue: Function
  hoveredMainValue: HoveredMainValue
}

type LineProps = {
  position: Position
  lineClassName: string | boolean
  value?: number
  onHover: Function
}

type Position = {
  x1: number
  y1: number
  x2: number
  y2: number
}

const LineComponent: React.FC<LineProps> = ({ position, lineClassName, value, onHover }) => {
  const { x1, y1, x2, y2 } = position

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={classnames(css.hoverLine, lineClassName)}
      onMouseLeave={() => onHover(undefined)}
      onMouseEnter={() => onHover(value)}
    />
  )
}

export const HoverLines: React.FC<Props> = ({
  scaleX,
  scaleY,
  lines,
  height,
  width,
  isVertical,
  hoveredMainValue,
  onChangeHoveredMainValue,
}) => {
  const mainValueKey = isVertical ? 'y' : 'x'
  const lineValues = _.uniqBy(_.flatten(lines.map(l => l.values)), v => v[mainValueKey])

  return (
    <g>
      {lineValues.map((lineValue, index) => {
        const mainValue = lineValue[mainValueKey]
        const position = isVertical
          ? {
              x1: 0,
              y1: scaleY(mainValue),
              x2: width,
              y2: scaleY(mainValue),
            }
          : {
              x1: scaleX(mainValue),
              y1: 0,
              x2: scaleX(mainValue),
              y2: height,
            }
        const isActive = mainValue === hoveredMainValue
        const commonProps = {
          position,
          value: mainValue,
          onHover: onChangeHoveredMainValue,
        }

        return (
          <React.Fragment key={index}>
            <LineComponent {...commonProps} lineClassName={css.isHoverable} />
            <LineComponent {...commonProps} lineClassName={isActive && css.isActive} />
          </React.Fragment>
        )
      })}
    </g>
  )
}
