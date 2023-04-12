import {
  Button,
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
import {
  formatDateDatetime,
  formatError,
  useBalance,
  useCreateOffer,
} from '@nft/hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import dayjs from 'dayjs'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import ButtonWithNetworkSwitch from '../../Button/SwitchNetwork'
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
  auctionExpirationDate: string
}

type Props = {
  signer: (Signer & TypedDataSigner) | undefined
  account: string | null | undefined
  currencies: {
    id: string
    decimals: number
    symbol: string
    image: string
    name: string
  }[]
  assetId: string
  chainId: number
  blockExplorer: BlockExplorer
  onCreated: (offerId: string) => void
  auctionId: string | undefined
  auctionValidity: number
  offerValidity: number
  feesPerTenThousand: number
  allowTopUp: boolean
} & (
  | {
      multiple: true
      supply: string
    }
  | {
      multiple: false
      owner: string
    }
)

const OfferFormBid: FC<Props> = (props) => {
  const { t } = useTranslation('components')
  const {
    signer,
    account,
    currencies,
    assetId,
    chainId,
    blockExplorer,
    onCreated,
    auctionId,
    auctionValidity,
    offerValidity,
    feesPerTenThousand,
    allowTopUp,
  } = props
  const [createOffer, { activeStep, transactionHash }] = useCreateOffer(signer)
  const toast = useToast()
  const { openConnectModal } = useConnectModal()
  const {
    isOpen: createOfferIsOpen,
    onOpen: createOfferOnOpen,
    onClose: createOfferOnClose,
  } = useDisclosure()

  const defaultAuctionExpirationValue = formatDateDatetime(
    dayjs().add(auctionValidity, 'second').toISOString(),
  )
  const defaultExpirationValue = formatDateDatetime(
    dayjs().add(offerValidity, 'second').toISOString(),
  )
  const minDate = formatDateDatetime(dayjs().add(1, 'day').toISOString())
  const maxDate = formatDateDatetime(dayjs().add(1, 'year').toISOString())
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
      auctionExpirationDate: defaultAuctionExpirationValue,
    },
  })

  useEffect(() => {
    const defaultCurrency = currencies[0]?.id
    if (defaultCurrency) setValue('currencyId', defaultCurrency)
    setValue('expiredAt', defaultExpirationValue)
    setValue('auctionExpirationDate', defaultAuctionExpirationValue)
  }, [
    currencies,
    defaultExpirationValue,
    defaultAuctionExpirationValue,
    setValue,
  ])

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

  const totalPrice = useMemo(() => {
    return priceUnit.mul(quantityBN)
  }, [priceUnit, quantityBN])

  const balanceZero = useMemo(() => {
    if (!balance) return false
    return balance.isZero()
  }, [balance])

  const totalFees = useMemo(() => {
    if (!totalPrice) return BigNumber.from(0)
    return totalPrice.mul(feesPerTenThousand).div(10000)
  }, [totalPrice, feesPerTenThousand])

  const canBid = useMemo(() => {
    if (!balance) return false
    if (!totalPrice) return true
    return balance.gte(totalPrice.add(totalFees))
  }, [balance, totalPrice, totalFees])

  const onSubmit = handleSubmit(async ({ expiredAt }) => {
    if (!auctionId && !expiredAt) throw new Error('expiredAt is required')
    invariant(currency)
    try {
      createOfferOnOpen()
      const id = await createOffer({
        type: 'BUY',
        quantity: quantityBN,
        unitPrice: priceUnit,
        assetId: assetId,
        currencyId: currency.id,
        takerAddress: props.multiple
          ? undefined // Keep the bid open for anyone that can fill it
          : props.owner.toLowerCase(),
        expiredAt: auctionId ? null : new Date(expiredAt),
        auctionId,
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

  const expirationProps = useMemo(
    () =>
      auctionId
        ? { ...register('auctionExpirationDate'), disabled: true }
        : {
            ...register('expiredAt', {
              required: t('offer.form.bid.validation.required'),
            }),
          },
    [auctionId, register, t],
  )

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
      <FormControl isInvalid={!!errors.bid}>
        <HStack spacing={1} mb={2}>
          <FormLabel htmlFor="bid" m={0}>
            {t('offer.form.bid.price.label')}
          </FormLabel>
          <FormHelperText>({currency.symbol})</FormHelperText>
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
              objectFit="cover"
            />
          </InputRightElement>
        </InputGroup>
        {errors.bid && (
          <FormErrorMessage>{errors.bid.message}</FormErrorMessage>
        )}
      </FormControl>

      {props.multiple && (
        <FormControl isInvalid={!!errors.quantity}>
          <HStack spacing={1} mb={2}>
            <FormLabel htmlFor="quantity" m={0}>
              {t('offer.form.bid.quantity.label')}
            </FormLabel>
            <FormHelperText>
              ({t('offer.form.bid.quantity.suffix')})
            </FormHelperText>
          </HStack>
          <InputGroup>
            <NumberInput
              clampValueOnBlur={false}
              min={1}
              max={parseInt(props.supply, 10)}
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
                      parseInt(value, 10) > parseInt(props.supply, 10)
                    ) {
                      return t('offer.form.bid.validation.in-range', {
                        max: parseInt(props.supply, 10),
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
                count: parseInt(props.supply, 10),
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
          <FormHelperText>
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
          type="datetime-local"
          min={minDate}
          max={maxDate}
          {...expirationProps}
        />
        {errors.expiredAt && (
          <FormErrorMessage>{errors.expiredAt.message}</FormErrorMessage>
        )}
      </FormControl>

      <div>
        <Summary
          currency={currency}
          price={priceUnit}
          quantity={quantityBN}
          isSingle={!props.multiple}
          feesOnTopPerTenThousand={feesPerTenThousand}
        />
      </div>

      {account ? (
        <>
          <Balance
            signer={signer}
            account={account}
            currency={currency}
            allowTopUp={allowTopUp && ((price && !canBid) || balanceZero)}
          />
          <ButtonWithNetworkSwitch
            chainId={chainId}
            isDisabled={!canBid}
            isLoading={isSubmitting}
            size="lg"
            type="submit"
          >
            <Text as="span" isTruncated>
              {t('offer.form.bid.submit')}
            </Text>
          </ButtonWithNetworkSwitch>
        </>
      ) : (
        <Button size="lg" type="button" onClick={openConnectModal}>
          <Text as="span" isTruncated>
            {t('offer.form.bid.submit')}
          </Text>
        </Button>
      )}

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
