import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
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
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useAcceptOffer } from '@liteflow/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { CheckoutQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBalance from '../../../hooks/useBalance'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import useSigner from '../../../hooks/useSigner'
import { formatError } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import AcceptOfferModal from '../../Modal/AcceptOffer'
import Balance from '../../User/Balance'
import Summary from '../Summary'

type FormData = {
  quantity: string
}

type Props = {
  offer: NonNullable<CheckoutQuery['offer']>
  onPurchased: () => void
  multiple?: boolean
}

const OfferFormCheckout: FC<Props> = ({ onPurchased, multiple, offer }) => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const { address: account } = useAccount()
  const blockExplorer = useBlockExplorer(offer.asset.chainId)
  const [acceptOffer, { activeStep, transactionHash }] = useAcceptOffer(signer)
  const toast = useToast()
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
  } = useForm<FormData>({ defaultValues: { quantity: '1' } })

  const quantity = watch('quantity')

  const [balance] = useBalance(account, offer.currency.id)

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
      await acceptOffer(offer.id, quantity)
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
    <Stack as="form" onSubmit={onSubmit} w="full" spacing={8}>
      {multiple && (
        <FormControl isInvalid={!!errors.quantity}>
          <HStack spacing={1} mb={2}>
            <FormLabel htmlFor="quantity" m={0}>
              {t('offer.form.checkout.quantity.label')}
            </FormLabel>
            <FormHelperText m={0}>
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
        currency={offer.currency}
        price={priceUnit}
        quantity={quantityBN}
        isSingle={!multiple}
        noFees
      />

      {account && <Balance account={account} currency={offer.currency} />}

      <Alert status="info" borderRadius="xl">
        <AlertIcon />
        <Box fontSize="sm">
          <AlertTitle>{t('offer.form.checkout.ownership.title')}</AlertTitle>
          <AlertDescription>
            {t('offer.form.checkout.ownership.description')}
          </AlertDescription>
        </Box>
      </Alert>

      <ConnectButtonWithNetworkSwitch
        chainId={offer.asset.chainId}
        isDisabled={!canPurchase}
        isLoading={isSubmitting}
        size="lg"
        type="submit"
      >
        <Text as="span" isTruncated>
          {t('offer.form.checkout.submit')}
        </Text>
      </ConnectButtonWithNetworkSwitch>

      <AcceptOfferModal
        isOpen={acceptOfferIsOpen}
        onClose={acceptOfferOnClose}
        title={t('offer.form.checkout.title')}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </Stack>
  )
}

export default OfferFormCheckout
