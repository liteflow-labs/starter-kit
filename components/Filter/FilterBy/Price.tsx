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
import { FC, useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  CurrencyFilter,
  InputMaybe,
  useChainCurrenciesQuery,
} from '../../../graphql'
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

  const { data: currencyData } = useChainCurrenciesQuery({
    variables: {
      filter:
        filterResult.chains.length > 0
          ? ({ chainId: { in: filterResult.chains } } as CurrencyFilter)
          : (undefined as unknown as InputMaybe<CurrencyFilter>),
    },
    ssr: false,
  })
  const currencies = currencyData?.currencies?.nodes

  const currency = useMemo(() => {
    if (currencies === undefined) return undefined
    if (currencies.length === 1) return currencies[0]
    return (
      currencies.find((x) => x.id === filterResult.currency?.id) ||
      currencies[0]
    )
  }, [currencies, filterResult.currency])

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
                value: x,
                label: x.symbol,
                image: x.image,
                caption: x.name,
              }))}
              value={currency}
              required
              isDisabled={isSubmitting}
              onChange={(x: any) => setValue('currency', x)}
              sortAlphabetically
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

          <Button isDisabled={isSubmitting} onClick={() => onFilterChange()}>
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
