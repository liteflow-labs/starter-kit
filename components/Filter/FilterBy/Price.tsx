import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useFetchCurrenciesQuery } from '../../../graphql'
import { Filter } from '../../../hooks/useAssetFilterFromQuery'
import Image from '../../Image/Image'
import Select from '../../Select/Select'

type Props = {
  formValues: UseFormReturn<Filter, any, undefined>
  onFilterChange: (data?: Partial<Filter>) => void
}

const FilterByPrice: FC<Props> = ({
  formValues: {
    control,
    register,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  },
  onFilterChange,
}) => {
  const { t } = useTranslation('components')

  const filterResult = watch()

  const { data: currencyData } = useFetchCurrenciesQuery({
    ssr: false,
  })
  const currencies = useMemo(
    () =>
      filterResult.chains.length > 0
        ? currencyData?.currencies?.nodes.filter((currency) =>
            filterResult.chains.includes(currency.chainId),
          )
        : currencyData?.currencies?.nodes,
    [currencyData, filterResult],
  )

  const currency = useMemo(() => {
    if (currencies === undefined) return undefined
    return filterResult.currency
      ? currencies.find((x) => x.id === filterResult.currency?.id)
      : currencies[0]
  }, [currencies, filterResult.currency])

  useEffect(() => {
    if (currency) {
      setValue('currency', { id: currency.id, decimals: currency.decimals })
    }
    if (filterResult.minPrice) {
      setValue('minPrice', filterResult.minPrice)
    }
    if (filterResult.maxPrice) {
      setValue('maxPrice', filterResult.maxPrice)
    }
  }, [currency, filterResult.maxPrice, filterResult.minPrice, setValue])

  const onSubmit = useCallback(() => {
    onFilterChange({
      currency: filterResult.currency,
      minPrice: filterResult.minPrice,
      maxPrice: filterResult.maxPrice,
    })
  }, [filterResult, onFilterChange])

  if (!currencies)
    return (
      <AccordionItem isDisabled>
        <AccordionButton>
          <Heading variant="heading2" flex="1" textAlign="left">
            {t('filters.assets.currency.label')}
          </Heading>
          <Spinner size="sm" />
        </AccordionButton>
      </AccordionItem>
    )

  if (!currency) return null
  return (
    <AccordionItem>
      <AccordionButton>
        <Heading variant="heading2" flex="1" textAlign="left">
          {t('filters.assets.currency.label')}
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Stack spacing={3}>
          {currencies.length === 1 ? (
            <Flex>
              <Image
                src={currency.image}
                alt={currency.symbol}
                width={24}
                height={24}
                w={6}
                h={6}
                objectFit="cover"
              />
              <Text ml="2">{currency.symbol}</Text>
            </Flex>
          ) : (
            <Select<{ id: string; decimals: number }>
              name="currency"
              control={control}
              placeholder={t('filters.assets.currency.placeholder')}
              choices={currencies.map((x) => ({
                value: { id: x.id, decimals: x.decimals },
                label: x.symbol,
                image: x.image,
                caption: x.name,
              }))}
              value={{ id: currency.id, decimals: currency.decimals }}
              required
              isDisabled={isSubmitting}
              onChange={(x: any) =>
                setValue('currency', { id: x.id, decimals: x.decimals })
              }
            />
          )}

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
                    placeholder={t('filters.assets.min-price.placeholder')}
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
                    value={filterResult.minPrice || undefined}
                  />
                </NumberInput>
                <InputRightElement pointerEvents="none">
                  <Image
                    src={currency.image}
                    alt={currency.symbol}
                    width={24}
                    height={24}
                    w={6}
                    h={6}
                    objectFit="cover"
                  />
                </InputRightElement>
              </InputGroup>
              {errors.minPrice && (
                <FormErrorMessage>{errors.minPrice.message}</FormErrorMessage>
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
                    placeholder={t('filters.assets.max-price.placeholder')}
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
                    value={filterResult.maxPrice || undefined}
                  />
                  <InputRightElement pointerEvents="none">
                    <Image
                      src={currency.image}
                      alt={currency.symbol}
                      width={24}
                      height={24}
                      w={6}
                      h={6}
                      objectFit="cover"
                    />
                  </InputRightElement>
                </NumberInput>
              </InputGroup>
              {errors.maxPrice && (
                <FormErrorMessage>{errors.maxPrice.message}</FormErrorMessage>
              )}
            </FormControl>
          </Flex>

          <Button isDisabled={isSubmitting} onClick={onSubmit}>
            <Text as="span" isTruncated>
              {t('filters.assets.submit')}
            </Text>
          </Button>
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  )
}

export default FilterByPrice
