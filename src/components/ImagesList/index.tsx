import { useLayoutEffect, useRef, useState } from 'react'

import useComponentSize from '@rehooks/component-size'
import classnames from 'classnames'
import * as _ from 'lodash'

import { ReactComponent as IconForwardSvg } from './icon_forward.svg'
import css from './index.css'

export type ImageItem = {
  preview?: string
  large: string
}

type Props = {
  images: readonly ImageItem[]
  activeItem?: number
  isAdaptive?: boolean
  onClick: (idx: number) => void
}

export const ImagesList: React.FC<Props> = ({ images, activeItem, isAdaptive = true, onClick }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { width: wrapperWidth } = useComponentSize(wrapperRef)
  const [offset, setOffset] = useState(0)
  const [scrollWidth, setScrollWidth] = useState(0)

  useLayoutEffect(() => {
    setScrollWidth(listRef.current!.scrollWidth)
  }, [wrapperWidth, images])

  useLayoutEffect(() => {
    const maxOffset = scrollWidth - wrapperWidth
    const clampedOffset = _.clamp(offset, 0, maxOffset)
    if (clampedOffset !== offset) {
      setOffset(clampedOffset)
    }
  })

  const handleMove = (direction: 'left' | 'right') => () => {
    const toRight = direction === 'right'

    setOffset(toRight ? offset + wrapperWidth : offset - wrapperWidth)
  }

  return (
    <div className={classnames(css.main, isAdaptive && css.isAdaptive)}>
      <div className={css.wrapper} ref={wrapperRef}>
        <div
          ref={listRef}
          className={css.list}
          style={{
            transform: `translateX(-${offset}px)`,
          }}
        >
          {images.map((image, idx) => (
            <button
              key={idx}
              type="button"
              className={classnames(css.item, idx === activeItem && css.isActive)}
              onClick={() => onClick(idx)}
            >
              <img src={image.preview || image.large} className={css.image} />
            </button>
          ))}
        </div>
      </div>
      {offset > 0 && (
        <button className={classnames(css.button, css.toLeft)} onClick={handleMove('left')}>
          <IconForwardSvg className={css.icon} />
        </button>
      )}
      {offset + wrapperWidth < scrollWidth && (
        <button className={classnames(css.button, css.toRight)} onClick={handleMove('right')}>
          <IconForwardSvg className={css.icon} />
        </button>
      )}
    </div>
  )
}