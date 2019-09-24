import { useLayoutEffect, useState } from 'react'
import * as React from 'react'
import ReactDOM from 'react-dom'
import ClickOutHandler from 'react-onclickout'

import { WidgetSettingsItem } from '@/components/WidgetSettingsItem'
import { Dataset } from '@/dashboard/types'
import { OnChangeParam, WithDataset } from '@/utils/WidgetFactory'

import { MarginSettings, Size, sizeValues } from './components/MarginSettings'
import css from './index.css'

export type WrapperParams = WithDataset<{
  marginTop?: Size
  marginRight?: Size
}>

type Props = {
  children: React.ReactNode
  datasets: readonly Dataset[]
  params: WrapperParams
  onChangeParam: OnChangeParam<WrapperParams>
  additionalSettings?: React.ReactNode
  showSettings?: boolean
  requestCloseSettings: () => void
}

export const WidgetWrapper: React.FC<Props> = ({
  children,
  datasets,
  params,
  onChangeParam,
  additionalSettings,
  showSettings,
  requestCloseSettings,
}) => {
  const ref = React.createRef<HTMLDivElement>()
  const [{ left, top }, setPosition] = useState({ left: 0, top: 0 })

  let portalEl = document.querySelector(`.${css.portal}`)

  useLayoutEffect(() => {
    if (showSettings && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPosition({ left: rect.right, top: rect.top })

      if (!portalEl) {
        portalEl = document.createElement('div')
        portalEl.classList.add(css.portal)
        document.body.append(portalEl)
      }
    }
  }, [showSettings])

  return (
    <div
      style={{
        marginTop: params.marginTop && sizeValues[params.marginTop],
        marginRight: params.marginRight && sizeValues[params.marginRight],
      }}
      ref={ref}
    >
      {children}
      {showSettings &&
        portalEl &&
        ReactDOM.createPortal(
          <ClickOutHandler onClickOut={requestCloseSettings}>
            <div className={css.settings} style={{ left, top }}>
              {datasets.length ? (
                <WidgetSettingsItem name="Датасет">
                  <select
                    value={params.datasetId}
                    onChange={e => onChangeParam('datasetId', e.target.value || undefined)}
                  >
                    <option value={''}>--</option>
                    {datasets.map(dataset => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </option>
                    ))}
                  </select>
                </WidgetSettingsItem>
              ) : null}
              <MarginSettings params={params} onChangeParam={onChangeParam} />
              {additionalSettings}
            </div>
          </ClickOutHandler>,
          portalEl
        )}
    </div>
  )
}
