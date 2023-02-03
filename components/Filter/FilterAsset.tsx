import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { convertCollection } from 'convert'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CollectionFilter,
  StringFilter,
  useFetchCollectionTraitsQuery,
  useSearchCollectionQuery,
} from '../../graphql'
import { Filter, OfferFilter } from '../../hooks/useAssetFilterFromQuery'
import CollectionListItem from '../Collection/ListItem'
import List from '../List/List'
import Select from '../Select/Select'

type Props = {
  currencies: { id: string; decimals: number; symbol?: string; image: string }[]
  filter: Filter
  selectedCollection?: { chainId: number; address: string }
  onFilterChange: (filter: Filter) => void
}

export const NoFilter: Filter = {
  collection: null,
  currencyId: null,
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
  currencies,
  filter,
  selectedCollection,
  onFilterChange,
}) => {
  const { t } = useTranslation('templates')

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

  const currency = useMemo(
    () =>
      currencies.length === 1
        ? currencies[0]
        : currencies.find((x) => x.id === filterResult.currencyId),
    [currencies, filterResult.currencyId],
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
      <Accordion allowMultiple defaultIndex={[2]}>
        <AccordionItem>
          <AccordionButton>
            <Heading variant="heading2" flex="1" textAlign="left">
              {t('explore.nfts.form.offers.label')}
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Flex gap={2}>
              {offerTypes.map(({ key, value }) => (
                <Button
                  key={key}
                  disabled={isSubmitting}
                  variant="outline"
                  size="sm"
                  px={4}
                  py={2.5}
                  height={10}
                  colorScheme={filterResult.offers === value ? 'brand' : 'gray'}
                  bgColor={
                    filterResult.offers === value ? 'brand.50' : undefined
                  }
                  onClick={() => propagateFilter({ offers: value })}
                >
                  {t(`explore.nfts.form.offers.values.${key}`)}
                </Button>
              ))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Heading variant="heading2" flex="1" textAlign="left">
              {t('explore.nfts.form.currency.label')}
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
                  />
                  <Text ml="2">{currency.symbol}</Text>
                </Flex>
              ) : (
                <Select
                  name="currencyId"
                  control={control as any} // TODO: fix this type
                  placeholder={t('explore.nfts.form.currency.placeholder')}
                  choices={currencies.map((x) => ({
                    value: x.id,
                    label: x.symbol || '',
                    image: x.image,
                  }))}
                  value={currency?.id}
                  required
                  disabled={isSubmitting}
                  error={errors.currencyId}
                  onChange={(x: any) => setValue('currencyId', x)}
                  sortAlphabetically
                />
              )}

              {currency && (
                <Flex gap={3}>
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
                            'explore.nfts.form.min-price.placeholder',
                          )}
                          {...register('minPrice', {
                            validate: (value) => {
                              if (!value) return
                              const splitValue = value.toString().split('.')

                              if (value < 0) {
                                return t(
                                  'explore.nfts.form.min-price.validation.positive',
                                )
                              }
                              if (
                                splitValue[1] &&
                                splitValue[1].length > currency.decimals
                              ) {
                                return t(
                                  'explore.nfts.form.min-price.validation.decimals',
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
                            'explore.nfts.form.max-price.placeholder',
                          )}
                          {...register('maxPrice', {
                            validate: (value) => {
                              if (value === null) return
                              const splitValue = value.toString().split('.')

                              if (value < 0) {
                                return t(
                                  'explore.nfts.form.max-price.validation.positive',
                                )
                              }
                              if (
                                splitValue[1] &&
                                splitValue[1].length > currency.decimals
                              ) {
                                return t(
                                  'explore.nfts.form.max-price.validation.decimals',
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

              <Button disabled={isSubmitting} onClick={() => propagateFilter()}>
                <Text as="span" isTruncated>
                  Apply
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
                  ? 'Properties'
                  : 'Collection and properties'}
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Stack spacing={3}>
                {!selectedCollection && (
                  <CollectionListItem
                    as={Link}
                    width="full"
                    borderColor="brand.500"
                    bgColor="brand.50"
                    borderWidth="1px"
                    borderRadius="md"
                    padding={2}
                    textAlign="left"
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
                    placeholder="Filter properties"
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
                {t('explore.nfts.form.collections.label')}
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
                    placeholder="Search by collection"
                    type="search"
                    onChange={(e) => setCollectionSearch(e.target.value)}
                  />
                </InputGroup>
                <List>
                  {collectionResult.data?.collections?.nodes.map((x) => (
                    <CollectionListItem
                      key={`${x.chainId}-${x.address}`}
                      as={Link}
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
            <AccordionButton>
              <Heading variant="heading2" flex="1" textAlign="left">
                {type} - {values.length}
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel maxHeight="400px" overflow="scroll">
              <Stack spacing={2}>
                {values.map(({ value, count }, i) => (
                  <Checkbox
                    key={i}
                    isChecked={filter.traits
                      .find((x) => x.type === type)
                      ?.values.includes(value)}
                    onChange={(e) =>
                      e.target.checked
                        ? addTrait(type, value)
                        : removeTrait(type, value)
                    }
                  >
                    <Flex justifyContent="space-between">
                      <Text>{value}</Text>
                      <Text color="gray.500">{count}</Text>
                    </Flex>
                  </Checkbox>
                ))}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  )
}

export default FilterAsset