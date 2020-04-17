import React from 'react'

import {
  Data as BarChartData,
  Groups as MultiBarChartGroup,
  SingleBarChartGroups,
} from '@/components/BarChart'
import { Data as DatePickerData } from '@/components/DatePicker'
import { Data as DonutChartData } from '@/components/DonutChart'
import { ImageItem } from '@/components/ImagesList'
import { Data as LegendData } from '@/components/Legend'
import { Line, Threshold } from '@/components/LinearChart'
import { Data as MapData } from '@/components/Map'
import { Data as ProgressBarData } from '@/components/ProgressBar'
import { Data as PyramidData } from '@/components/PyramidChart'
import { Data as RadarChartData } from '@/components/RadarChart'
import { Data as RoadmapData } from '@/components/Roadmap'
import { Data as StatsData } from '@/components/Stats'
import { Data as TableLegendData } from '@/components/TableLegend'
import { CurrentDashboard } from '@/dashboard/migration/migrations/current'
import { Status as BadgeStatus } from '@/ui/Badge'
import { Filters, TableColumn } from '@/utils/table'
import { ChoiceGroupData } from '@/widgets/ChoiceGroupWidget'

import Dashboard = CurrentDashboard

export type MarginSize = Dashboard.MarginSize
export type Settings = Dashboard.Settings
export type WidgetItem = Dashboard.WidgetItem
export type GridItem = Dashboard.GridItem
export type GridContent = Dashboard.GridContent
export type VerticalAlignment = Dashboard.VerticalAlignment
export type ColumnParams = Dashboard.ColumnParams
export type RowParams = Dashboard.RowParams
export type BoxItem = Dashboard.BoxItem
export type BoxItemParams = BoxItem['params']
export type BoxItemMarginSize = Dashboard.BoxItemMarginSize
export type CommonBoxItemParams = Dashboard.CommonBoxItemParams
export type SwitchItem = Dashboard.SwitchItem
export type SwitchContent = Dashboard.SwitchContent
export type Config = Dashboard.Config
export type DashboardState = Dashboard.State
export type DashboardVersion = DashboardState['version']

export enum DataType {
  Stats,
  Donut,
  BarChart,
  LinearChart,
  Pyramid,
  Text,
  TableLegend,
  Badge,
  MultiBarChart,
  ProgressBar,
  Legend,
  DatePicker,
  RadarChart,
  Roadmap,
  Image,
  Images,
  Button,
  ChoiceGroup,
  Checkbox,
  Map,
  Switch,
}

export type ColorGroups = { [key: string]: string }
type WithColorGroups = { colorGroups: ColorGroups }

export type FormatValue = (value: number) => string

export type DataMap = {
  [DataType.Stats]: StatsData
  [DataType.Donut]: DonutChartData & WithColorGroups
  [DataType.BarChart]: BarChartData &
    WithColorGroups & {
      groups: SingleBarChartGroups
    }
  [DataType.LinearChart]: {
    data: readonly Line[]
    formatValueForLabel?: FormatValue
    formatValueForTooltip?: FormatValue
    formatValueForTooltipTitle?: FormatValue
    unit?: string
    threshold?: Threshold
    onClickHoverLine?: (value: number) => void
  } & WithColorGroups
  [DataType.Pyramid]: readonly PyramidData[]
  [DataType.Text]: { text: string; tooltip?: React.ReactNode; onClick?: Function }
  [DataType.TableLegend]: TableLegendData
  [DataType.Badge]: {
    status: BadgeStatus
    text?: string
    comment?: string
  }
  [DataType.ProgressBar]: {
    data: readonly ProgressBarData[]
  } & WithColorGroups
  [DataType.MultiBarChart]: BarChartData &
    WithColorGroups & {
      groups: MultiBarChartGroup
    }
  [DataType.Legend]: {
    data: LegendData
  } & WithColorGroups
  [DataType.DatePicker]: DatePickerData
  [DataType.RadarChart]: RadarChartData & WithColorGroups
  [DataType.Roadmap]: ReadonlyArray<
    {
      title?: string
      subTitle?: {
        name: string
        value: string
      }
      data: {
        values: readonly RoadmapData[]
        titles: readonly [TableColumn, TableColumn]
        currentDay: number
        startDate: number
        endDate: number
        filters?: Filters
      }
      legend?: LegendData
    } & WithColorGroups
  >
  [DataType.Image]: string
  [DataType.Images]: readonly ImageItem[]
  [DataType.Button]: {
    content: React.ReactNode
    tooltip?: React.ReactNode
    disabled?: boolean
    iconOnly?: boolean
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  }
  [DataType.ChoiceGroup]: ChoiceGroupData
  [DataType.Checkbox]: {
    content: React.ReactNode
    value?: boolean
    disabled?: boolean
    intermediate?: boolean
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  }
  [DataType.Map]: MapData
  [DataType.Switch]: number
}

export type Dataset = {
  name: string
  id: string
  type: DataType
  groupName?: string
}

export type Data = { [k: string]: DataMap[DataType] }
