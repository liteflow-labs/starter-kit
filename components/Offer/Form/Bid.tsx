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
import { toAddress } from '@liteflow/core'
import { useCreateOffer } from '@liteflow/react'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import { BidOnAssetQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBalance from '../../../hooks/useBalance'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useEnvironment from '../../../hooks/useEnvironment'
import useFees from '../../../hooks/useFees'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import useSigner from '../../../hooks/useSigner'
import { formatDateDatetime, formatError } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import Image from '../../Image/Image'
import CreateOfferModal from '../../Modal/CreateOffer'
import Select from '../../Select/Select'
import Balance from '../../User/Balance'
import Summary from '../Summary'

type FormData = {
  bid: string
  quantity: string
  currencyId: string
  expiredAt: string
}

type Props = {
  asset: NonNullable<BidOnAssetQuery['asset']>
  currencies: {
    id: string
    address: string | null
    decimals: number
    symbol: string
    image: string
    name: string
  }[]
  onCreated: (offerId: string) => void
}

const OfferFormBid: FC<Props> = ({ asset, currencies, onCreated }) => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const { address: account } = useAccount()
  const [createOffer, { activeStep, transactionHash }] = useCreateOffer(signer)
  const { OFFER_VALIDITY_IN_SECONDS } = useEnvironment()
  const blockExplorer = useBlockExplorer(asset.chainId)
  const toast = useToast()
  const {
    isOpen: createOfferIsOpen,
    onOpen: createOfferOnOpen,
    onClose: createOfferOnClose,
  } = useDisclosure()

  const isMultiple = useMemo(
    () => asset.collection.standard === 'ERC1155',
    [asset.collection.standard],
  )
  const ownerAddress = useMemo(
    () => asset.ownerships.nodes[0]?.ownerAddress,
    [asset.ownerships.nodes],
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
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
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

  const price = watch('bid')
  const quantity = watch('quantity')
  const currencyId = watch('currencyId')

  const currency = useMemo(
    () => currencies.find((x) => x.id === currencyId),
    [currencies, currencyId],
  )

  const [balance] = useBalance(account, currency?.id || null)
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

  const canBid = useMemo(() => {
    if (
      balance === undefined ||
      feesPerTenThousand === undefined ||
      loadingFees // disable creation of bid if fees are being fetched
    )
      return false
    const totalPrice = priceUnit.mul(quantityBN)
    const totalFees = totalPrice.mul(feesPerTenThousand).div(10000)
    return balance.gte(totalPrice.add(totalFees))
  }, [balance, feesPerTenThousand, loadingFees, priceUnit, quantityBN])

  const onSubmit = handleSubmit(async ({ expiredAt }) => {
    if (!expiredAt) throw new Error('expiredAt is required')
    invariant(currency?.address, 'currency address is required')
    try {
      createOfferOnOpen()
      const id = await createOffer({
        type: 'BUY',
        quantity: quantityBN,
        unitPrice: {
          amount: priceUnit,
          currency: toAddress(currency.address),
        },
        chain: asset.chainId,
        collection: toAddress(asset.collectionAddress),
        token: asset.tokenId,
        taker: isMultiple
          ? undefined // Keep the bid open for anyone that can fill it
          : ownerAddress
            ? toAddress(ownerAddress)
            : undefined,
        expiredAt: new Date(expiredAt),
      })

      onCreated(id)
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    } finally {
      createOfferOnClose()
    }
  })

  if (!currency) return <></>
  return (
    <Stack as="form" onSubmit={onSubmit} w="full" spacing={8}>
      {currencies.length > 1 && (
        <Select
          label={t('offer.form.bid.currency.label')}
          name="currencyId"
          hint={t('offer.form.bid.currency.hint')}
          control={control}
          placeholder={t('offer.form.bid.currency.placeholder')}
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
      <FormControl isInvalid={!!errors.bid}>
        <HStack spacing={1} mb={2}>
          <FormLabel htmlFor="bid" m={0}>
            {t('offer.form.bid.price.label')}
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
            onChange={(x) => setValue('bid', x)}
          >
            <NumberInputField
              id="bid"
              placeholder={t('offer.form.bid.price.placeholder')}
              {...register('bid', {
                required: t('offer.form.bid.validation.required'),
                validate: (value) => {
                  if (parseFloat(value) <= 0)
                    return t('offer.form.bid.validation.positive')

                  const nbDecimals = value.split('.')[1]?.length || 0
                  if (nbDecimals > currency.decimals)
                    return t('offer.form.bid.validation.decimals', {
                      nbDecimals: currency.decimals,
                    })
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
        {errors.bid && (
          <FormErrorMessage>{errors.bid.message}</FormErrorMessage>
        )}
      </FormControl>

      {isMultiple && (
        <FormControl isInvalid={!!errors.quantity}>
          <HStack spacing={1} mb={2}>
            <FormLabel htmlFor="quantity" m={0}>
              {t('offer.form.bid.quantity.label')}
            </FormLabel>
            <FormHelperText m={0}>
              ({t('offer.form.bid.quantity.suffix')})
            </FormHelperText>
          </HStack>
          <InputGroup>
            <NumberInput
              clampValueOnBlur={false}
              min={1}
              max={parseInt(asset.quantity, 10)}
              allowMouseWheel
              w="full"
              onChange={(x) => setValue('quantity', x)}
            >
              <NumberInputField
                id="quantity"
                placeholder={t('offer.form.bid.quantity.placeholder')}
                {...register('quantity', {
                  required: t('offer.form.bid.validation.required'),
                  validate: (value) => {
                    if (
                      parseInt(value, 10) < 1 ||
                      parseInt(value, 10) > parseInt(asset.quantity, 10)
                    ) {
                      return t('offer.form.bid.validation.in-range', {
                        max: parseInt(asset.quantity, 10),
                      })
                    }
                    if (!/^\d+$/.test(value)) {
                      return t('offer.form.bid.validation.integer')
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
          <FormHelperText>
            <Text as="p" variant="text" color="gray.500">
              {t('offer.form.bid.supply', {
                count: parseInt(asset.quantity, 10),
              })}
            </Text>
          </FormHelperText>
        </FormControl>
      )}

      <FormControl isInvalid={!!errors.expiredAt}>
        <HStack spacing={1} mb={2}>
          <FormLabel htmlFor="expiredAt" m={0}>
            {t('offer.form.bid.expiration.label')}
          </FormLabel>
          <FormHelperText m={0}>
            <Tooltip
              label={
                <Text as="span" variant="caption" color="brand.black">
                  {t('offer.form.bid.expiration.tooltip')}
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
          {...register('expiredAt', {
            required: t('offer.form.bid.validation.required'),
          })}
          type="datetime-local"
          min={minDate}
          max={maxDate}
        />
        {errors.expiredAt && (
          <FormErrorMessage>{errors.expiredAt.message}</FormErrorMessage>
        )}
      </FormControl>

      <Summary
        currency={currency}
        price={priceUnit}
        quantity={quantityBN}
        isSingle={!isMultiple}
        feesOnTopPerTenThousand={feesPerTenThousand}
      />

      {account && <Balance account={account} currency={currency} />}
      <ConnectButtonWithNetworkSwitch
        chainId={asset.chainId}
        isLoading={isSubmitting}
        isDisabled={!canBid}
        size="lg"
        type="submit"
      >
        <Text as="span" isTruncated>
          {t('offer.form.bid.submit')}
        </Text>
      </ConnectButtonWithNetworkSwitch>

      <CreateOfferModal
        isOpen={createOfferIsOpen}
        onClose={createOfferOnClose}
        title={t('offer.form.bid.title')}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </Stack>
  )
}

export default OfferFormBid
