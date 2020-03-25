import { DonutChart } from '@/components/DonutChart'
import { HalfDonut } from '@/components/DonutChart/components/Donut'
import { WidgetSettingsSelect } from '@/components/WidgetSettingsSelect'
import { DataMap, DataType } from '@/dashboard/types'
import { widgetIdsByType } from '@/utils/widgets-list'
import { createWidget, WidgetContentProps } from '@/utils/WidgetFactory'

const dataType = DataType.Donut
type Data = DataMap[typeof dataType]

type Params = {
  halfDonut?: HalfDonut
}

export const defaultParams: Params = {}

export const DonutChartWidgetContent: React.FC<WidgetContentProps<Data, Params>> = ({
  data,
  params: { halfDonut },
}) => <DonutChart {...data} halfDonut={halfDonut} />

export const DonutChartWidget = createWidget<Data, Params>({
  id: widgetIdsByType.DonutChartWidget,
  name: 'Пончик',
  defaultParams: {
    ...defaultParams,
    growRatio: 1,
  },
  dataType: DataType.Donut,
  Content: DonutChartWidgetContent,
  renderSettings(params, onChangeParam) {
    return (
      <WidgetSettingsSelect
        name="Обрезать пончик"
        value={params.halfDonut}
        onChange={value => onChangeParam('halfDonut', value)}
        values={[
          { name: '--', value: undefined },
          { name: 'Сверху', value: 'top' },
          { name: 'Справа', value: 'right' },
          { name: 'Снизу', value: 'bottom' },
          { name: 'Слева', value: 'left' },
        ]}
      />
    )
  },
})
