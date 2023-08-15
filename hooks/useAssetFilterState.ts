import { useBreakpointValue } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Filter } from './useAssetFilterFromQuery'

export default function useAssetFilterState(filter: Filter): {
  showFilters: boolean
  toggleFilters: () => void
  close: () => void
  count: number
} {
  const display = useBreakpointValue(
    { base: false, md: true },
    { fallback: 'md' },
  )
  const [showFilters, setShowFilters] = useState(!!display)
  const filterCount = useMemo(() => {
    let count = filter.traits.length
    if (filter.chains.length > 0) count += 1
    if (filter.collection) count += 1
    if (filter.minPrice) count += 1
    if (filter.maxPrice) count += 1
    if (filter.offers) count += 1
    return count
  }, [filter])

  useEffect(() => setShowFilters(!!display), [display, setShowFilters])

  return {
    showFilters: showFilters,
    toggleFilters: () => setShowFilters((x) => !x),
    close: () => setShowFilters(false),
    count: filterCount,
  }
}
