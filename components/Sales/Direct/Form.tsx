import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { toAddress } from '@liteflow/core'
import { CreateOfferStep, useCreateOffer } from '@liteflow/react'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Standard } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useEnvironment from '../../../hooks/useEnvironment'
import useFees from '../../../hooks/useFees'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import useSigner from '../../../hooks/useSigner'
import { formatDateDatetime, formatError, isSameAddress } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import Image from '../../Image/Image'
import CreateOfferModal from '../../Modal/CreateOffer'
import Price from '../../Price/Price'
import Select from '../../Select/Select'

type FormData = {
  price: string
  quantity: string
  currencyId: string
  expiredAt: string
}

type Props = {
  asset: {
    chainId: number
    collectionAddress: string
    tokenId: string
    collection: {
      standard: Standard
    }
    creator: {
      address: string
    }
    royalties: {
      value: number
    }[]
    owned: {
      quantity: string
    } | null
  }
  currencies: {
    name: string
    id: string
    address: string | null
    image: string
    decimals: number
    symbol: string
  }[]
  onCreated: (offerId: string) => void
}

const SalesDirectForm: FC<Props> = ({ asset, currencies, onCreated }) => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const signer = useSigner()
  const { address } = useAccount()
  const { OFFER_VALIDITY_IN_SECONDS } = useEnvironment()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const blockExplorer = useBlockExplorer(asset.chainId)

  const isCreator = address
    ? isSameAddress(asset.creator.address.toLowerCase(), address)
    : false
  const quantityAvailable = useMemo(
    () => BigNumber.from(asset.owned?.quantity || 0),
    [asset.owned?.quantity],
  )
  const royaltiesPerTenThousand = useMemo(
    () => asset.royalties.reduce((sum, { value }) => sum + value, 0),
    [asset.royalties],
  )
  const defaultExpirationValue = useMemo(
    () =>
      formatDateDatetime(
        dayjs().add(OFFER_VALIDITY_IN_SECONDS, 'second').toISOString(),
      ),
    [OFFER_VALIDITY_IN_SECONDS],
  )
  const minDate = useMemo(
    () => formatDateDatetime(dayjs().add(1, 'day').toISOString()),
    [],
  )
  const maxDate = useMemo(
    () => formatDateDatetime(dayjs().add(1, 'year').toISOString()),
    [],
  )

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quantity: '1',
      currencyId: currencies[0]?.id,
      expiredAt: defaultExpirationValue,
    },
  })

  useEffect(() => {
    const defaultCurrency = currencies[0]?.id
    if (defaultCurrency) setValue('currencyId', defaultCurrency)
    setValue('expiredAt', defaultExpirationValue)
  }, [currencies, defaultExpirationValue, setValue])

  const [createAndPublishOffer, { activeStep, transactionHash }] =
    useCreateOffer(signer)

  const price = watch('price')
  const quantity = watch('quantity')

  const currencyId = watch('currencyId')
  const currency = useMemo(
    () => currencies.find((x) => x.id === currencyId),
    [currencies, currencyId],
  )
  const priceUnit = useParseBigNumber(price, currency?.decimals)
  const quantityBN = useParseBigNumber(quantity)

  const { feesPerTenThousand, loading: loadingFees } = useFees({
    chainId: asset.chainId,
    collectionAddress: asset.collectionAddress,
    tokenId: asset.tokenId,
    currencyId: currency?.id,
    quantity: quantityBN,
    unitPrice: priceUnit,
  })

  const amountFees = useMemo(() => {
    if (feesPerTenThousand === undefined) return
    return priceUnit.mul(feesPerTenThousand).div(10000)
  }, [priceUnit, feesPerTenThousand])

  const amountRoyalties = useMemo(() => {
    return priceUnit.mul(royaltiesPerTenThousand).div(10000)
  }, [priceUnit, royaltiesPerTenThousand])

  const priceWithFees = useMemo(() => {
    if (amountFees === undefined) return
    return priceUnit.sub(amountFees).sub(isCreator ? 0 : amountRoyalties)
  }, [amountFees, priceUnit, amountRoyalties, isCreator])

  const onSubmit = handleSubmit(async ({ expiredAt }) => {
    if (activeStep !== CreateOfferStep.INITIAL) return
    if (!currency) throw new Error('currency falsy')
    if (
      asset.collection.standard !== 'ERC721' &&
      asset.collection.standard !== 'ERC1155'
    )
      throw new Error('invalid token')

    try {
      onOpen()
      const id = await createAndPublishOffer({
        type: 'SALE',
        quantity: quantityBN,
        chain: asset.chainId,
        collection: toAddress(asset.collectionAddress),
        token: asset.tokenId,
        unitPrice: {
          amount: priceUnit,
          currency: currency.address ? toAddress(currency.address) : null,
        },
        expiredAt: new Date(expiredAt),
      })

      onCreated(id)
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    } finally {
      onClose()
    }
  })

  const isSingle = useMemo(
    () => asset.collection.standard === 'ERC721',
    [asset.collection.standard],
  )

  if (!currency) return <></>
  return (
    <Stack as="form" spacing={8} onSubmit={onSubmit}>
      {currencies.length > 1 && (
        <Select
          label={t('sales.direct.form.currency.label')}
          name="currencyId"
          hint={t('sales.direct.form.currency.hint')}
          control={control}
          placeholder={t('sales.direct.form.currency.placeholder')}
          choices={currencies.map((x) => ({
            value: x.id,
            label: x.symbol,
            image: x.image,
            caption: x.name,
          }))}
          value={currencyId}
          required
          error={errors.currencyId}
          onChange={(x: any) => setValue('currencyId', x)}
          sortAlphabetically
        />
      )}

      <FormControl isInvalid={!!errors.price}>
        <HStack spacing={1} mb={2}>
          <FormLabel htmlFor="price" m={0}>
            {t('sales.direct.form.price.label')}
          </FormLabel>
          <FormHelperText m={0}>({currency.symbol})</FormHelperText>
        </HStack>
        <InputGroup>
          <NumberInput
            clampValueOnBlur={false}
            min={0}
            step={Math.pow(10, -currency.decimals)}
            allowMouseWheel
            w="full"
            onChange={(x) => setValue('price', x)}
          >
            <NumberInputField
              id="price"
              placeholder={t('sales.direct.form.price.placeholder')}
              {...register('price', {
                required: t('sales.direct.form.validation.required'),
                validate: (value) => {
                  if (parseFloat(value) <= 0) {
                    return t('sales.direct.form.validation.positive')
                  }

                  const nbDecimals = value.split('.')[1]?.length || 0
                  if (nbDecimals > currency.decimals) {
                    return t('sales.direct.form.validation.decimals', {
                      nbDecimals: currency.decimals,
                    })
                  }
                },
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <InputRightElement mr={6} pointerEvents="none">
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
        {errors.price && (
          <FormErrorMessage>{errors.price.message}</FormErrorMessage>
        )}
      </FormControl>

      {!isSingle && (
        <FormControl isInvalid={!!errors.quantity}>
          <HStack spacing={1} mb={2}>
            <FormLabel htmlFor="quantity" m={0}>
              {t('sales.direct.form.quantity.label')}
            </FormLabel>
            <FormHelperText m={0}>
              ({t('sales.direct.form.quantity.suffix')})
            </FormHelperText>
          </HStack>
          <InputGroup>
            <NumberInput
              clampValueOnBlur={false}
              min={1}
              max={
                quantityAvailable.lte(Number.MAX_SAFE_INTEGER - 1)
                  ? quantityAvailable.toNumber()
                  : Number.POSITIVE_INFINITY - 1
              }
              allowMouseWheel
              w="full"
              onChange={(x) => setValue('quantity', x)}
            >
              <NumberInputField
                id="quantity"
                placeholder={t('sales.direct.form.quantity.placeholder')}
                {...register('quantity', {
                  required: t('sales.direct.form.validation.required'),
                  validate: (value) => {
                    const valueBN = BigNumber.from(value)
                    if (valueBN.lt(1) || valueBN.gt(quantityAvailable)) {
                      return t('sales.direct.form.validation.in-range', {
                        max: quantityAvailable.toString(),
                      })
                    }
                    if (!/^\d+$/.test(value)) {
                      return t('sales.direct.form.validation.integer')
                    }
                  },
                })}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </InputGroup>
          {errors.quantity && (
            <FormErrorMessage>{errors.quantity.message}</FormErrorMessage>
          )}
          {quantityAvailable && (
            <FormHelperText>
              <Text as="p" variant="text" color="gray.500">
                {t('sales.direct.form.available', {
                  count: quantityAvailable.lte(Number.MAX_SAFE_INTEGER - 1)
                    ? quantityAvailable.toNumber()
                    : Number.MAX_SAFE_INTEGER - 1,
                })}
              </Text>
            </FormHelperText>
          )}
        </FormControl>
      )}

      <FormControl isInvalid={!!errors.expiredAt}>
        <HStack spacing={1} mb={2}>
          <FormLabel htmlFor="expiredAt" m={0}>
            {t('sales.direct.form.expiration.label')}
          </FormLabel>
          <FormHelperText m={0}>
            <Tooltip
              label={
                <Text as="span" variant="caption" color="brand.black">
                  {t('sales.direct.form.expiration.tooltip')}
                </Text>
              }
              placement="top"
              rounded="xl"
              shadow="lg"
              p={3}
              bg="white"
            >
              <span>
                <Icon
                  as={FaInfoCircle}
                  h={4}
                  w={4}
                  cursor="pointer"
                  color="gray.400"
                />
              </span>
            </Tooltip>
          </FormHelperText>
        </HStack>
        <Input
          type="datetime-local"
          min={minDate}
          max={maxDate}
          {...register('expiredAt', {
            required: t('sales.direct.form.validation.required'),
          })}
        />
        {errors.expiredAt && (
          <FormErrorMessage>{errors.expiredAt.message}</FormErrorMessage>
        )}
      </FormControl>

      <Stack spacing={2}>
        {isSingle && (
          <>
            {feesPerTenThousand === undefined || amountFees === undefined ? (
              <Skeleton noOfLines={1} height={4} width={200} mt={2} />
            ) : (
              <Text variant="text" color="gray.500">
                {t('sales.direct.form.fees', {
                  value: feesPerTenThousand / 100,
                })}
                <Text
                  as={Price}
                  color="brand.black"
                  ml={1}
                  fontWeight="semibold"
                  amount={amountFees}
                  currency={currency}
                />
              </Text>
            )}

            <Text variant="text" color="gray.500">
              {t('sales.direct.form.royalties', {
                value: royaltiesPerTenThousand / 100,
              })}
              <Text
                as={Price}
                color="brand.black"
                ml={1}
                fontWeight="semibold"
                amount={amountRoyalties}
                currency={currency}
              />
            </Text>

            {priceWithFees === undefined ? (
              <Skeleton noOfLines={1} height={4} width={200} mt={2} />
            ) : (
              <Text variant="text" color="gray.500">
                {t('sales.direct.form.receive-single')}
                <Text
                  as={Price}
                  color="brand.black"
                  ml={1}
                  fontWeight="semibold"
                  amount={priceWithFees}
                  currency={currency}
                />
              </Text>
            )}
          </>
        )}

        {!isSingle && (
          <>
            <Text variant="text" color="gray.500">
              {t('sales.direct.form.receive-multiple')}
              <Text
                as={Price}
                color="brand.black"
                ml={1}
                fontWeight="semibold"
                amount={priceUnit}
                currency={currency}
              />
            </Text>

            <Text variant="text" color="gray.500">
              {t('sales.direct.form.quantity-for-sale')}
              <Text as="span" color="brand.black" ml={1} fontWeight="semibold">
                {t('sales.direct.form.quantities', {
                  count: parseInt(quantity, 10),
                })}
              </Text>
            </Text>

            {feesPerTenThousand === undefined || amountFees === undefined ? (
              <Skeleton noOfLines={1} height={4} width={200} mt={2} />
            ) : (
              <Text variant="text" color="gray.500">
                {t('sales.direct.form.total-fees', {
                  value: feesPerTenThousand / 100,
                })}
                <Text
                  as={Price}
                  color="brand.black"
                  mx={1}
                  fontWeight="semibold"
                  amount={amountFees.mul(quantityBN)}
                  currency={currency}
                />
              </Text>
            )}

            <Text variant="text" color="gray.500">
              {t('sales.direct.form.total-royalties', {
                value: royaltiesPerTenThousand / 100,
              })}
              <Text
                as={Price}
                color="brand.black"
                ml={1}
                fontWeight="semibold"
                amount={amountRoyalties.mul(quantityBN)}
                currency={currency}
              />
            </Text>

            {priceWithFees === undefined ? (
              <Skeleton noOfLines={1} height={4} width={200} mt={2} />
            ) : (
              <Text variant="text" color="gray.500">
                {t('sales.direct.form.total-receive')}
                <Text
                  as={Price}
                  color="brand.black"
                  mx={1}
                  fontWeight="semibold"
                  amount={priceWithFees.mul(quantityBN)}
                  currency={currency}
                />
              </Text>
            )}
          </>
        )}
      </Stack>

      <ConnectButtonWithNetworkSwitch
        chainId={asset.chainId}
        isLoading={activeStep !== CreateOfferStep.INITIAL}
        isDisabled={loadingFees}
        size="lg"
        type="submit"
        width="full"
      >
        <Text as="span" isTruncated>
          {t('sales.direct.form.submit')}
        </Text>
      </ConnectButtonWithNetworkSwitch>

      <CreateOfferModal
        isOpen={isOpen}
        onClose={onClose}
        title={t('sales.direct.form.title')}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </Stack>
  )
}

export default SalesDirectForm
