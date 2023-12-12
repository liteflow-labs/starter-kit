import { Stack, Tag, TagLabel } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo, useState } from 'react'
import { AssetHistoryAction } from '../../graphql'

type IProps = {
  filter: AssetHistoryAction[]
  onFilterChange: (filter: AssetHistoryAction[]) => void
}

export const DEFAULT_HISTORY_FILTER = [
  'LAZYMINT',
  'LISTING',
  'PURCHASE',
  'MINT',
  'TRANSFER',
  'BURN',
] as AssetHistoryAction[]

const HistoryListFilter: FC<IProps> = ({ filter, onFilterChange }) => {
  const { t } = useTranslation('components')
  const [selection, setSelection] = useState<AssetHistoryAction[] | 'ALL'>(
    'ALL',
  )

  const handleFilterChange = useCallback(
    (value: AssetHistoryAction | 'ALL') => {
      // onClick of 'All' tag, reset filter to default
      if (value === 'ALL') {
        setSelection(value)
        return onFilterChange(DEFAULT_HISTORY_FILTER)
      }
      // onClick of a tag that is the only one selected, reset filter to default
      if (selection.length === 1 && selection.includes(value)) {
        setSelection('ALL')
        return onFilterChange(DEFAULT_HISTORY_FILTER)
      }
      // onClick of a tag that is selected, remove it from filter
      if (selection.includes(value)) {
        setSelection(filter.filter((v) => v !== value))
        return onFilterChange(filter.filter((v) => v !== value))
      }
      // if 'All' tag is selected and user clicks on another tag,
      // remove 'All' tag from filter and add the new tag to filter
      if (selection === 'ALL') {
        setSelection([value])
        return onFilterChange([value])
      }
      // onClick of a tag that is not selected, add it to filter and keep the rest of the filter
      setSelection([...selection, value])
      return onFilterChange([...selection, value])
    },
    [selection, onFilterChange, filter],
  )

  const tags = useMemo(
    () => [
      {
        title: t('history.filter.all'),
        isActive: selection === 'ALL',
        onClick: () => handleFilterChange('ALL'),
      },
      {
        title: t('history.filter.lazymint'),
        isActive: selection.includes('LAZYMINT'),
        onClick: () => handleFilterChange('LAZYMINT'),
      },
      {
        title: t('history.filter.listing'),
        isActive: selection.includes('LISTING'),
        onClick: () => handleFilterChange('LISTING'),
      },
      {
        title: t('history.filter.purchase'),
        isActive: selection.includes('PURCHASE'),
        onClick: () => handleFilterChange('PURCHASE'),
      },
      {
        title: t('history.filter.transfer'),
        isActive: selection.includes('TRANSFER'),
        onClick: () => handleFilterChange('TRANSFER'),
      },
      {
        title: t('history.filter.mint'),
        isActive: selection.includes('MINT'),
        onClick: () => handleFilterChange('MINT'),
      },
      {
        title: t('history.filter.burn'),
        isActive: selection.includes('BURN'),
        onClick: () => handleFilterChange('BURN'),
      },
    ],
    [handleFilterChange, selection, t],
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
