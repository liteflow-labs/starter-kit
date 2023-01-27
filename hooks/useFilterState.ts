import { useMemo, useState } from 'react'
import { Filter } from './useAssetFilterFromQuery'

export default function useFilterState(filter: Filter): {
  showFilters: boolean
  toggleFilters: () => void
  count: number
} {
  const [showFilters, setShowFilters] = useState(true)
  const filterCount = useMemo(() => {
    let count = filter.traits.length
    if (filter.collection) count += 1
    if (filter.minPrice) count += 1
    if (filter.maxPrice) count += 1
    if (filter.offers) count += 1
    return count
  }, [filter])

  return {
    showFilters: showFilters,
    toggleFilters: () => setShowFilters((x) => !x),
    count: filterCount,
  }
}
