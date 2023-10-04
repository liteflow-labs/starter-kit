import { Stack, Tag, TagLabel } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo } from 'react'
import { AssetHistoryAction } from '../../graphql'

type IProps = {
  filter: AssetHistoryAction[]
  onFilterChange: (filter: AssetHistoryAction[]) => void
}

export const DEFAULT_HISTORY_FILTER = [
  'LAZYMINT',
  'LISTING',
  'PURCHASE',
  'TRANSFER',
] as AssetHistoryAction[]

const HistoryListFilter: FC<IProps> = ({ filter, onFilterChange }) => {
  const { t } = useTranslation('components')

  const showAll = useMemo(
    () => DEFAULT_HISTORY_FILTER.every((v) => filter.includes(v)),
    [filter],
  )

  const handleFilterChange = useCallback(
    (value: AssetHistoryAction | undefined) => {
      if (!value) return onFilterChange(DEFAULT_HISTORY_FILTER)
      if (showAll) return onFilterChange([value])
      if (filter.length === 1 && filter.includes(value))
        return onFilterChange(DEFAULT_HISTORY_FILTER)
      if (filter.includes(value))
        onFilterChange(filter.filter((v) => v !== value))
      else onFilterChange([...filter, value])
    },
    [filter, onFilterChange, showAll],
  )

  const tags = useMemo(
    () => [
      {
        title: 'All',
        isActive: showAll,
        onClick: () => handleFilterChange(undefined),
      },
      {
        title: 'Lazymint',
        isActive: !showAll && filter.includes('LAZYMINT'),
        onClick: () => handleFilterChange('LAZYMINT'),
      },
      {
        title: 'Listing',
        isActive: !showAll && filter.includes('LISTING'),
        onClick: () => handleFilterChange('LISTING'),
      },
      {
        title: 'Purchase',
        isActive: !showAll && filter.includes('PURCHASE'),
        onClick: () => handleFilterChange('PURCHASE'),
      },
      {
        title: 'Transfer',
        isActive: !showAll && filter.includes('TRANSFER'),
        onClick: () => handleFilterChange('TRANSFER'),
      },
    ],
    [filter, handleFilterChange, showAll],
  )

  return (
    <Stack direction="row" spacing={4} overflowX="auto" mb={-2} pb={2} w="full">
      {tags.map(({ title, isActive, onClick }, i) => (
        <Tag
          key={i}
          variant={isActive ? 'solid' : 'outline'}
          colorScheme="brand"
          cursor="pointer"
          onClick={onClick}
          flexShrink={0}
        >
          <TagLabel>{title}</TagLabel>
        </Tag>
      ))}
    </Stack>
  )
}

export default HistoryListFilter
