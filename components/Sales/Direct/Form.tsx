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
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { toAddress } from '@liteflow/core'
import { CreateOfferStep, useCreateOffer } from '@liteflow/react'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Standard, useFeesQuery } from '../../../graphql'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import { formatDateDatetime, formatError } from '../../../utils'
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
  chainId: number
  collectionAddress: string
  tokenId: string
  standard: Standard
  currencies: {
    name: string
    id: string
    address: string | null
    image: string
    decimals: number
    symbol: string
  }[]
  royaltiesPerTenThousand: number
  quantityAvailable: BigNumber
  signer: (Signer & TypedDataSigner) | undefined
  isCreator: boolean
  offerValidity: number
  blockExplorer: BlockExplorer
  onCreated: (offerId: string) => void
}

const SalesDirectForm: FC<Props> = ({
  chainId,
  collectionAddress,
  tokenId,
  standard,
  currencies,
  royaltiesPerTenThousand,
  quantityAvailable,
  signer,
  isCreator,
  offerValidity,
  blockExplorer,
  onCreated,
}) => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const defaultExpirationValue = formatDateDatetime(
    dayjs().add(offerValidity, 'second').toISOString(),
  )
  const minDate = formatDateDatetime(dayjs().add(1, 'day').toISOString())
  const maxDate = formatDateDatetime(dayjs().add(1, 'year').toISOString())

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

  const { data } = useFeesQuery({
    variables: {
      chainId,
      collectionAddress,
      tokenId,
      currencyId: currency?.id || '',
      quantity: quantityBN.toString(),
      unitPrice: priceUnit.toString(),
    },
    skip: !currency?.id,
  })
  const feesPerTenThousand = useMemo(
    () => data?.orderFees.valuePerTenThousand || 0,
    [data],
  )

  const amountFees = useMemo(() => {
    if (!price) return BigNumber.from(0)
    return priceUnit.mul(feesPerTenThousand).div(10000)
  }, [price, priceUnit, feesPerTenThousand])

  const amountRoyalties = useMemo(() => {
    if (!price) return BigNumber.from(0)
    return priceUnit.mul(royaltiesPerTenThousand).div(10000)
  }, [price, priceUnit, royaltiesPerTenThousand])

  const priceWithFees = useMemo(() => {
    return priceUnit.sub(amountFees).sub(isCreator ? 0 : amountRoyalties)
  }, [amountFees, priceUnit, amountRoyalties, isCreator])

  const onSubmit = handleSubmit(async ({ expiredAt }) => {
    if (activeStep !== CreateOfferStep.INITIAL) return
    if (!currency) throw new Error('currency falsy')
    if (standard !== 'ERC721' && standard !== 'ERC1155')
      throw new Error('invalid token')

    try {
      onOpen()
      const id = await createAndPublishOffer({
        type: 'SALE',
        quantity: quantityBN,
        chain: chainId,
        collection: toAddress(collectionAddress),
        token: tokenId,
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

  const isSingle = useMemo(() => standard === 'ERC721', [standard])

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
            label: x.symbol || '',
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
            <Text variant="text" color="gray.500">
              {t('sales.direct.form.fees', { value: feesPerTenThousand / 100 })}
              <Text
                as={Price}
                color="brand.black"
                ml={1}
                fontWeight="semibold"
                amount={amountFees}
                currency={currency}
              />
            </Text>

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
          </>
        )}

        <Text variant="text" color="gray.500">
          {isSingle
            ? t('sales.direct.form.receive-single')
            : t('sales.direct.form.receive-multiple')}
          <Text
            as={Price}
            color="brand.black"
            ml={1}
            fontWeight="semibold"
            amount={isSingle ? priceWithFees : priceUnit}
            currency={currency}
          />
        </Text>

        {!isSingle && (
          <>
            <Text variant="text" color="gray.500">
              {t('sales.direct.form.quantity-for-sale')}
              <Text as="span" color="brand.black" ml={1} fontWeight="semibold">
                {t('sales.direct.form.quantities', {
                  count: parseInt(quantity, 10),
                })}
              </Text>
            </Text>

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
          </>
        )}
      </Stack>

      <ConnectButtonWithNetworkSwitch
        chainId={chainId}
        isLoading={activeStep !== CreateOfferStep.INITIAL}
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
