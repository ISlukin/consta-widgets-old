import React from 'react'

import { action } from '@storybook/addon-actions'
import { select } from '@storybook/addon-knobs'
import { Dictionary, zipObject } from 'lodash'
import { withSmartKnobs } from 'storybook-addon-smart-knobs'

import { createMetadata, createStory } from '@/_private/storybook'
import { Group } from '@/MultiBarChart'

import { SludgeChart } from '.'

const colors = {
  sandstone: '#D4E23D',
  siltstone: '#5ABBAB',
  mudstone:
    'repeating-linear-gradient(to bottom, #002D47, #002D47 2px, transparent 2px, transparent 4px) #E3E3E3',
}
const groups: readonly Group[] = [
  {
    groupName: '1360',
    values: [
      [
        { value: 27, color: colors.sandstone },
        { value: 46, color: colors.siltstone },
        { value: 27, color: colors.mudstone },
      ],
    ],
  },
  {
    groupName: '1370',
    values: [
      [
        { value: 5, color: colors.sandstone },
        { value: 60, color: colors.siltstone },
        { value: 35, color: colors.mudstone },
      ],
    ],
  },
  {
    groupName: '1380',
    values: [
      [
        { value: 60, color: colors.sandstone },
        { value: 5, color: colors.siltstone },
        { value: 35, color: colors.mudstone },
      ],
    ],
  },
  {
    groupName: '1390',
    values: [
      [
        { value: 20, color: colors.sandstone },
        { value: 30, color: colors.siltstone },
        { value: 50, color: colors.mudstone },
      ],
    ],
  },
  {
    groupName: '1400',
    values: [
      [
        { value: 20, color: colors.sandstone },
        { value: 30, color: colors.siltstone },
        { value: 50, color: colors.mudstone },
      ],
    ],
  },
]

const getSelectList = <T extends string | number>(list: T[]): Dictionary<T | undefined> =>
  zipObject(['--', ...list], [undefined, ...list])

const groupNames = groups.map(({ groupName }) => groupName)
const activeGroupSelectList = getSelectList(groupNames)

const sectionIndexes = Object.keys(colors).map((_, i) => i)
const activeSectionIndexSelectList = getSelectList(sectionIndexes)

export const Interactive = createStory(() => {
  return (
    <SludgeChart
      groups={groups}
      activeSectionIndex={select('activeSectionIndex', activeSectionIndexSelectList, undefined)}
      activeGroup={select('activeGroup', activeGroupSelectList, undefined)}
      formatValueForLabel={value => `${value}%`}
      onMouseEnterColumn={action('onMouseEnterColumn')}
      onMouseLeaveColumn={action('onMouseLeaveColumn')}
      withScroll={false}
    />
  )
})

export default createMetadata({
  title: 'components/SludgeChart',
  decorators: [withSmartKnobs()],
  parameters: {
    environment: {
      style: {
        width: '40vw',
        height: '30vh',
      },
    },
  },
})
