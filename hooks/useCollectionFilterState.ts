import { useBreakpointValue } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Filter } from './useCollectionFilterFromQuery'

export default function useCollectionFilterState(filter: Filter): {
  showFilters: boolean
  toggleFilters: () => void
  close: () => void
  count: number
} {
  const display =
    useBreakpointValue({ base: false, md: true }, { fallback: 'md' }) || false
  const [showFilters, setShowFilters] = useState(display)
  const filterCount = useMemo(() => {
    let count = 0
    if (filter.chains.length > 0) count += 1
    return count
  }, [filter])

  useEffect(() => setShowFilters(display), [display, setShowFilters])

  return {
    showFilters: showFilters,
    toggleFilters: () => setShowFilters((x) => !x),
    close: () => setShowFilters(false),
    count: filterCount,
  }
}
