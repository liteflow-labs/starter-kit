import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiChevronLeft } from '@react-icons/all-files/hi/HiChevronLeft'
import { HiOutlineAdjustments } from '@react-icons/all-files/hi/HiOutlineAdjustments'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

type Props = {
  showFilters: boolean
  toggleFilters: () => void
  count: number
  onClear: () => void
}

const FilterNav: FC<Props> = ({
  count,
  showFilters,
  toggleFilters,
  onClear,
}) => {
  const { t } = useTranslation('components')
  const isSmall = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  )
  return (
    <HStack spacing={4}>
      <Button onClick={toggleFilters} colorScheme="gray" variant="outline">
        {showFilters ? (
          <Icon as={HiChevronLeft} />
        ) : (
          <Icon as={HiOutlineAdjustments} />
        )}
        <Text ml="2">{t('filters.nav.title')}</Text>
      </Button>
      {count > 0 && !isSmall && (
        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={onClear}
          leftIcon={
            <Box
              rounded="full"
              bg="brand.500"
              color="white"
              width="5"
              height="5"
              fontSize="80%"
              lineHeight="5"
            >
              {count}
            </Box>
          }
        >
          {t('filters.nav.clear')}
        </Button>
      )}
    </HStack>
  )
}

export default FilterNav
