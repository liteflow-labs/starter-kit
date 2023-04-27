import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { convertCollection } from 'convert'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { chains } from '../../connectors'
import {
  CollectionFilter,
  CurrencyFilter,
  InputMaybe,
  StringFilter,
  useChainCurrenciesQuery,
  useFetchCollectionTraitsQuery,
  useSearchCollectionQuery,
} from '../../graphql'
import { Filter, OfferFilter } from '../../hooks/useAssetFilterFromQuery'
import CollectionListItem from '../Collection/ListItem'
import List from '../List/List'
import Select from '../Select/Select'

type Props = {
  filter: Filter
  selectedCollection?: { chainId: number; address: string }
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
  { key: 'fixed', value: OfferFilter.fixed },
  { key: 'auction', value: OfferFilter.auction },
]

const FilterAsset: NextPage<Props> = ({
  filter,
  selectedCollection,
  onFilterChange,
}) => {
  const { t } = useTranslation('components')
  const isSmall = useBreakpointValue({ base: true, sm: false })

  const {
    register,
    formState: { isSubmitting, errors },
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
  } = useForm<Filter>({
    defaultValues: filter,
  })
  const filterResult = watch()
  useEffect(() => {
    reset(filter)
    return () => reset(NoFilter)
  }, [reset, filter])

  const { data: currencyData } = useChainCurrenciesQuery({
    variables: {
      filter:
        filterResult.chains.length > 0
          ? ({ chainId: { in: filterResult.chains } } as CurrencyFilter)
          : (undefined as unknown as InputMaybe<CurrencyFilter>),
    },
  })
  const currencies = useMemo(
    () => currencyData?.currencies?.nodes || [],
    [currencyData],
  )

  const currency = useMemo(
    () =>
      currencies.length === 1
        ? currencies[0]
        : currencies.find((x) => x.id === filterResult.currency?.id) ||
          currencies[0],
    [currencies, filterResult.currency],
  )

  const [collectionSearch, setCollectionSearch] = useState('')
  const [propertySearch, setPropertySearch] = useState('')
  const collectionResult = useSearchCollectionQuery({
    variables: {
      limit: 8,
      offset: 0,
      orderBy: ['TOTAL_VOLUME_DESC'],
      filter: {
        name: { includesInsensitive: collectionSearch } as StringFilter,
        ...(filterResult.chains.length
          ? { chainId: { in: filterResult.chains } }
          : {}),
      } as CollectionFilter,
    },
    skip: !!selectedCollection,
  })

  const collection = useMemo(() => {
    if (selectedCollection) return selectedCollection
    if (!filterResult.collection) return null
    const [chainId, address] = filterResult.collection.split('-')
    if (!chainId || !address) return null
    return collectionResult.data?.collections?.nodes.find(
      (x) => x.address === address && x.chainId === parseInt(chainId, 10),
    )
  }, [collectionResult.data, filterResult.collection, selectedCollection])

  const { data: traitsData } = useFetchCollectionTraitsQuery({
    variables: {
      address: (collection && collection.address) || '',
      chainId: (collection && collection.chainId) || 0,
    },
    skip: !collection,
  })

  const traits = useMemo(() => {
    if (!traitsData?.collection?.traits) return []
    if (!propertySearch) return traitsData.collection.traits
    return traitsData.collection.traits.filter(({ type }) =>
      type.toLowerCase().includes(propertySearch.toLowerCase()),
    )
  }, [propertySearch, traitsData])

  const addTrait = useCallback(
    (type, value) => {
      const existingValues =
        filterResult.traits.find((x) => x.type === type)?.values || []
      onFilterChange({
        ...filterResult,
        traits: [
          ...filterResult.traits.filter((x) => x.type !== type),
          {
            type,
            values: [
              ...(existingValues.filter((x) => x !== value) || []),
              value,
            ],
          },
        ],
      })
    },
    [onFilterChange, filterResult],
  )

  const removeTrait = useCallback(
    (type, value) => {
      const existingValues =
        filterResult.traits.find((x) => x.type === type)?.values || []
      const traits = filterResult.traits.filter((x) => x.type !== type)
      if (existingValues.includes(value) && existingValues.length === 1) {
        onFilterChange({ ...filterResult, traits })
      } else {
        onFilterChange({
          ...filterResult,
          traits: [
            ...traits,
            {
              type,
              values: existingValues.filter((x) => x !== value),
            },
          ],
        })
      }
    },
    [onFilterChange, filterResult],
  )

  const propagateFilter = useCallback(
    (data: Partial<Filter> = {}) =>
      onFilterChange({ ...filterResult, ...data }),
    [filterResult, onFilterChange],
  )

  return (
    <Stack spacing={8} as="form" onSubmit={handleSubmit(onFilterChange)}>
      <Accordion allowMultiple defaultIndex={isSmall ? [] : [2]}>
        {chains.length > 1 && (
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
                  {chains.map(({ id, name }, i) => (
                    <Checkbox key={i} value={id}>
                      <Flex gap={2} alignItems="center">
                        <Image
                          src={`/chains/${id}.svg`}
                          width={24}
                          height={24}
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
        )}
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
        <AccordionItem>
          <AccordionButton>
            <Heading variant="heading2" flex="1" textAlign="left">
              {t('filters.assets.currency.label')}
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Stack spacing={3}>
              {currencies.length === 1 && currency ? (
                <Flex>
                  <Image
                    src={currency.image}
                    alt={currency.symbol}
                    width={24}
                    height={24}
                    objectFit="cover"
                  />
                  <Text ml="2">{currency.symbol}</Text>
                </Flex>
              ) : (
                <Select<{ id: string; decimals: number }>
                  name="currency"
                  control={control as any} // TODO: fix this type
                  placeholder={t('filters.assets.currency.placeholder')}
                  choices={currencies.map((x) => ({
                    value: x,
                    label: x.symbol || '',
                    image: x.image,
                  }))}
                  value={currency}
                  required
                  isDisabled={isSubmitting}
                  onChange={(x: any) => setValue('currency', x)}
                  sortAlphabetically
                />
              )}

              {currency && (
                <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
                  <FormControl isInvalid={!!errors.minPrice}>
                    <InputGroup>
                      <NumberInput
                        clampValueOnBlur={false}
                        min={0}
                        step={Math.pow(10, -currency.decimals)}
                        precision={currency.decimals}
                        w="full"
                        isDisabled={isSubmitting}
                        onChange={(x: any) => setValue('minPrice', x)}
                        format={(e) => e.toString()}
                      >
                        <NumberInputField
                          placeholder={t(
                            'filters.assets.min-price.placeholder',
                          )}
                          {...register('minPrice', {
                            validate: (value) => {
                              if (!value) return
                              const splitValue = value.toString().split('.')

                              if (value < 0) {
                                return t(
                                  'filters.assets.min-price.validation.positive',
                                )
                              }
                              if (
                                splitValue[1] &&
                                splitValue[1].length > currency.decimals
                              ) {
                                return t(
                                  'filters.assets.min-price.validation.decimals',
                                  {
                                    nbDecimals: currency.decimals,
                                  },
                                )
                              }
                            },
                          })}
                        />
                      </NumberInput>
                      <InputRightElement pointerEvents="none">
                        <Image
                          src={currency.image}
                          alt={currency.symbol}
                          width={24}
                          height={24}
                          objectFit="cover"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.minPrice && (
                      <FormErrorMessage>
                        {errors.minPrice.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl isInvalid={!!errors.maxPrice}>
                    <InputGroup>
                      <NumberInput
                        clampValueOnBlur={false}
                        min={0}
                        step={Math.pow(10, -currency.decimals)}
                        precision={currency.decimals}
                        w="full"
                        isDisabled={isSubmitting}
                        onChange={(x: any) => setValue('maxPrice', x)}
                        format={(e) => e.toString()}
                      >
                        <NumberInputField
                          placeholder={t(
                            'filters.assets.max-price.placeholder',
                          )}
                          {...register('maxPrice', {
                            validate: (value) => {
                              if (value === null) return
                              const splitValue = value.toString().split('.')

                              if (value < 0) {
                                return t(
                                  'filters.assets.max-price.validation.positive',
                                )
                              }
                              if (
                                splitValue[1] &&
                                splitValue[1].length > currency.decimals
                              ) {
                                return t(
                                  'filters.assets.max-price.validation.decimals',
                                  {
                                    nbDecimals: currency.decimals,
                                  },
                                )
                              }
                            },
                          })}
                        />
                        <InputRightElement pointerEvents="none">
                          <Image
                            src={currency.image}
                            alt={currency.symbol}
                            width={24}
                            height={24}
                            objectFit="cover"
                          />
                        </InputRightElement>
                      </NumberInput>
                    </InputGroup>
                    {errors.maxPrice && (
                      <FormErrorMessage>
                        {errors.maxPrice.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </Flex>
              )}

              <Button
                isDisabled={isSubmitting}
                onClick={() => propagateFilter()}
              >
                <Text as="span" isTruncated>
                  {t('filters.assets.submit')}
                </Text>
              </Button>
            </Stack>
          </AccordionPanel>
        </AccordionItem>

        {collection ? (
          <AccordionItem>
            <AccordionButton>
              <Heading variant="heading2" flex="1" textAlign="left">
                {selectedCollection
                  ? t('filters.assets.properties.label')
                  : t('filters.assets.properties.labelWithCollection')}
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Stack spacing={3}>
                {!selectedCollection && (
                  <CollectionListItem
                    width="full"
                    borderColor="brand.500"
                    bgColor="brand.50"
                    borderWidth="1px"
                    borderRadius="md"
                    padding={2}
                    textAlign="left"
                    cursor="pointer"
                    onClick={() =>
                      propagateFilter({ collection: null, traits: [] })
                    }
                    collection={convertCollection(collection as any)}
                    closable
                  />
                )}
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={HiOutlineSearch} w={6} h={6} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder={t(
                      'filters.assets.properties.search.placeholder',
                    )}
                    type="search"
                    onChange={(e) => setPropertySearch(e.target.value)}
                  />
                </InputGroup>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        ) : (
          <AccordionItem>
            <AccordionButton>
              <Heading variant="heading2" flex="1" textAlign="left">
                {t('filters.assets.collections.label')}
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Stack spacing={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={HiOutlineSearch} w={6} h={6} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder={t(
                      'filters.assets.collections.search.placeholder',
                    )}
                    type="search"
                    onChange={(e) => setCollectionSearch(e.target.value)}
                  />
                </InputGroup>
                <List>
                  {collectionResult.data?.collections?.nodes.map((x) => (
                    <CollectionListItem
                      key={`${x.chainId}-${x.address}`}
                      cursor={'pointer'}
                      rounded="xl"
                      transition={'background-color 0.3s ease-in-out'}
                      _hover={{
                        bgColor: 'brand.50',
                      }}
                      onClick={() =>
                        propagateFilter({
                          collection: `${x.chainId}-${x.address}`,
                          traits: [],
                        })
                      }
                      collection={convertCollection(x)}
                    />
                  ))}
                </List>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        )}

        {traits.map(({ type, values }, i) => (
          <AccordionItem key={i}>
            <AccordionButton gap={4}>
              <Heading
                variant="heading2"
                flex="1"
                textAlign="left"
                noOfLines={1}
                wordBreak="break-word"
                title={type}
              >
                {type}
              </Heading>
              <Flex gap="4" alignItems="center">
                <Heading variant="heading2" color="gray.500">
                  {values.length}
                </Heading>
                <AccordionIcon />
              </Flex>
            </AccordionButton>
            <AccordionPanel maxHeight="400px" overflow="auto">
              <CheckboxGroup
                defaultValue={
                  filter?.traits?.find((trait) => trait.type === type)?.values
                }
              >
                <Stack spacing={1}>
                  {values.map(({ value, count }, i) => (
                    <Checkbox
                      key={i}
                      value={value}
                      name={type}
                      onChange={(e) =>
                        e.target.checked
                          ? addTrait(type, value)
                          : removeTrait(type, value)
                      }
                    >
                      <Flex justifyContent="space-between" gap={3}>
                        <Text
                          variant="subtitle2"
                          color="black"
                          noOfLines={1}
                          wordBreak="break-word"
                          title={value}
                        >
                          {value}
                        </Text>
                        <Text variant="subtitle2" color="black">
                          {count}
                        </Text>
                      </Flex>
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  )
}

export default FilterAsset
