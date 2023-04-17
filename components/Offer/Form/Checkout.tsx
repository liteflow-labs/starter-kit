import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  InputGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { formatError, useAcceptOffer, useBalance } from '@nft/hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Offer } from '../../../graphql'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import ButtonWithNetworkSwitch from '../../Button/SwitchNetwork'
import AcceptOfferModal from '../../Modal/AcceptOffer'
import Balance from '../../User/Balance'
import Summary from '../Summary'

type FormData = {
  quantity: string
}

type Props = {
  signer: Signer | undefined
  account: string | null | undefined
  offer: Pick<Offer, 'id' | 'unitPrice' | 'availableQuantity'>
  chainId: number
  blockExplorer: BlockExplorer
  currency: {
    id: string
    decimals: number
    symbol: string
  }
  onPurchased: () => void
  multiple?: boolean
  allowTopUp: boolean
}

const OfferFormCheckout: FC<Props> = ({
  signer,
  account,
  currency,
  onPurchased,
  multiple,
  offer,
  chainId,
  blockExplorer,
  allowTopUp,
}) => {
  const { t } = useTranslation('components')
  const [acceptOffer, { activeStep, transactionHash }] = useAcceptOffer(signer)
  const toast = useToast()
  const { openConnectModal } = useConnectModal()
  const {
    isOpen: acceptOfferIsOpen,
    onOpen: acceptOfferOnOpen,
    onClose: acceptOfferOnClose,
  } = useDisclosure()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      quantity: offer.availableQuantity,
    },
  })

  useEffect(
    () => setValue('quantity', offer.availableQuantity),
    [offer.availableQuantity, setValue],
  )

  const quantity = watch('quantity')

  const [balance] = useBalance(account, currency.id)

  const priceUnit = useParseBigNumber(offer.unitPrice)
  const quantityBN = useParseBigNumber(quantity)

  const canPurchase = useMemo(() => {
    if (!balance || !quantityBN) return false
    return balance.gte(priceUnit.mul(quantityBN))
  }, [balance, priceUnit, quantityBN])

  const onSubmit = handleSubmit(async ({ quantity }) => {
    if (!offer) throw new Error('offer falsy')
    try {
      acceptOfferOnOpen()
      await acceptOffer(offer, quantity)
      onPurchased()
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    } finally {
      acceptOfferOnClose()
    }
  })

  return (
    <form onSubmit={onSubmit}>
      {multiple && (
        <FormControl isInvalid={!!errors.quantity}>
          <HStack spacing={1} mb={2}>
            <FormLabel htmlFor="quantity" m={0}>
              {t('offer.form.checkout.quantity.label')}
            </FormLabel>
            <FormHelperText>
              {t('offer.form.checkout.quantity.suffix')}
            </FormHelperText>
          </HStack>
          <InputGroup>
            <NumberInput
              clampValueOnBlur={false}
              min={1}
              max={parseInt(offer.availableQuantity, 10)}
              allowMouseWheel
              w="full"
              onChange={(x) => setValue('quantity', x)}
            >
              <NumberInputField
                id="quantity"
                placeholder={t('offer.form.checkout.quantity.placeholder')}
                {...register('quantity', {
                  required: t('offer.form.checkout.validation.required'),
                  validate: (value) => {
                    if (
                      parseInt(value, 10) < 1 ||
                      parseInt(value, 10) >
                        parseInt(offer.availableQuantity, 10)
                    ) {
                      return t('offer.form.checkout.validation.in-range', {
                        max: parseInt(offer.availableQuantity, 10),
                      })
                    }
                    if (!/^\d+$/.test(value)) {
                      return t('offer.form.checkout.validation.integer')
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
              {t('offer.form.checkout.available', {
                count: parseInt(offer.availableQuantity, 10),
              })}
            </Text>
          </FormHelperText>
        </FormControl>
      )}
      <Summary
        currency={currency}
        price={priceUnit}
        quantity={quantityBN}
        isSingle={!multiple}
      />

      {/* There seems to be a rendering issue when signed in, account fetched and
      page is refreshed that will cause the <Alert /> component below to render weirdly.
      Wrapping the conditional with a div solves the issue */}
      <div>
        {account && (
          <Balance
            signer={signer}
            account={account}
            currency={currency}
            allowTopUp={allowTopUp && !canPurchase}
          />
        )}
      </div>

      <Alert status="info" borderRadius="xl" mb={8}>
        <AlertIcon />
        <Box fontSize="sm">
          <AlertTitle>{t('offer.form.checkout.ownership.title')}</AlertTitle>
          <AlertDescription>
            {t('offer.form.checkout.ownership.description')}
          </AlertDescription>
        </Box>
      </Alert>
      {account ? (
        <ButtonWithNetworkSwitch
          chainId={chainId}
          isDisabled={!!account && !canPurchase}
          isLoading={isSubmitting}
          size="lg"
          type="submit"
        >
          <Text as="span" isTruncated>
            {t('offer.form.checkout.submit')}
          </Text>
        </ButtonWithNetworkSwitch>
      ) : (
        <Button size="lg" type="button" onClick={openConnectModal}>
          <Text as="span" isTruncated>
            {t('offer.form.checkout.submit')}
          </Text>
        </Button>
      )}

      <AcceptOfferModal
        isOpen={acceptOfferIsOpen}
        onClose={acceptOfferOnClose}
        title={t('offer.form.checkout.title')}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </form>
  )
}

export default OfferFormCheckout
