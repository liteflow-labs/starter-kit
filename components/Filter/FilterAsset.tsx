import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Filter, OfferFilterType } from '../../hooks/useAssetFilterFromQuery'
import useEnvironment from '../../hooks/useEnvironment'
import Image from '../Image/Image'
import FilterByCollection from './FilterBy/Collection'
import FilterByPrice from './FilterBy/Price'
import FilterByTrait from './FilterBy/Trait'

type Props = {
  filter: Filter
  currentCollection?: {
    chainId: number
    address: string
    name: string
    image: string | null
    floorPrice: {
      valueInRef: string
      refCode: string
    } | null
    totalVolume: {
      valueInRef: string
      refCode: string
    }
  }
  noChain?: boolean
  onFilterChange: (filter: Filter) => void
}

export const NoFilter: Filter = {
  chains: [],
  collection: null,
  currency: null,
  maxPrice: null,
  minPrice: null,
  offers: null,
  search: null,
  traits: [],
}

const offerTypes = [
  { key: 'all', value: null },
  { key: 'fixed', value: OfferFilterType.fixed },
  { key: 'bids', value: OfferFilterType.bids },
]

const FilterAsset: NextPage<Props> = ({
  filter,
  currentCollection,
  noChain,
  onFilterChange,
}) => {
  const { CHAINS } = useEnvironment()
  const { t } = useTranslation('components')
  const isSmall = useBreakpointValue(
    { base: true, sm: false },
    { fallback: 'sm' },
  )

  const formValues = useForm<Filter>({
    defaultValues: filter,
  })
  const {
    formState: { isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = formValues
  const filterResult = watch()

  const collection = useMemo(() => {
    if (currentCollection) {
      return {
        chainId: currentCollection.chainId,
        address: currentCollection.address,
      }
    }
    if (filterResult.collection) {
      const [chainId, address] = filterResult.collection.split('-')
      if (!chainId || !address) return
      return {
        chainId: parseInt(chainId, 10),
        address,
      }
    }
  }, [currentCollection, filterResult.collection])

  useEffect(() => {
    reset(filter)
    return () => reset(NoFilter)
  }, [reset, filter])

  const propagateFilter = useCallback(
    (data: Partial<Filter> = {}) =>
      onFilterChange({ ...filterResult, ...data }),
    [filterResult, onFilterChange],
  )

  return (
    <Stack spacing={8} as="form" onSubmit={handleSubmit(onFilterChange)}>
      <Accordion
        allowMultiple
        defaultIndex={isSmall ? [] : [noChain ? 2 : CHAINS.length > 1 ? 3 : 2]}
      >
        {noChain ||
          (CHAINS.length > 1 && (
            <AccordionItem>
              <AccordionButton>
                <Heading variant="heading2" flex="1" textAlign="left">
                  {t('filters.assets.chains.label')}
                </Heading>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <CheckboxGroup
                  value={filterResult.chains}
                  defaultValue={[]}
                  onChange={(value) =>
                    propagateFilter({ chains: value as number[] })
                  }
                >
                  <Stack spacing={1}>
                    {CHAINS.map(({ id, name }, i) => (
                      <Checkbox key={i} value={id}>
                        <Flex gap={2} alignItems="center">
                          <Image
                            src={`/chains/${id}.svg`}
                            width={24}
                            height={24}
                            w={6}
                            h={6}
                            alt={name}
                          />
                          <Text
                            variant="subtitle2"
                            color="black"
                            noOfLines={1}
                            wordBreak="break-word"
                            title={name}
                          >
                            {name}
                          </Text>
                        </Flex>
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </AccordionPanel>
            </AccordionItem>
          ))}
        <AccordionItem>
          <AccordionButton>
            <Heading variant="heading2" flex="1" textAlign="left">
              {t('filters.assets.offers.label')}
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Flex
              gap={2}
              direction={{ base: 'column', sm: 'row' }}
              flexWrap="wrap"
            >
              {offerTypes.map(({ key, value }) => (
                <Button
                  key={key}
                  isDisabled={isSubmitting}
                  variant="outline"
                  size="sm"
                  px={4}
                  py={2.5}
                  height={10}
                  color="black"
                  borderColor={
                    filterResult.offers === value ? 'brand.500' : 'gray.200'
                  }
                  bgColor={
                    filterResult.offers === value ? 'brand.50' : undefined
                  }
                  onClick={() => propagateFilter({ offers: value })}
                >
                  <Text variant="subtitle2">
                    {t(`filters.assets.offers.values.${key}`)}
                  </Text>
                </Button>
              ))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <FormProvider {...formValues}>
          <FilterByPrice
            formValues={formValues}
            onFilterChange={propagateFilter}
          />
          {!currentCollection && (
            <FilterByCollection
              formValues={formValues}
              onFilterChange={propagateFilter}
            />
          )}
          {currentCollection && <Divider mb={4} />}
          {collection && (
            <FilterByTrait
              collection={collection}
              formValues={formValues}
              onFilterChange={onFilterChange}
            />
          )}
        </FormProvider>
      </Accordion>
    </Stack>
  )
}

export default FilterAsset
