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
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { useAcceptOffer } from '@liteflow/react'
import WertWidget from '@wert-io/widget-initializer'
import { signSmartContractData } from '@wert-io/widget-sc-signer'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Offer } from '../../../graphql'
import useBalance from '../../../hooks/useBalance'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import { formatError } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import AcceptOfferModal from '../../Modal/AcceptOffer'
import Balance from '../../User/Balance'
import Summary from '../Summary'

type FormData = {
  quantity: string
}

type Props = {
  signer: Signer | undefined
  account: string | null | undefined
  asset: any
  offer: Pick<Offer, 'id' | 'unitPrice' | 'availableQuantity'> & {
    maker: { name: string | null | undefined; address: string }
  }
  chainId: number
  blockExplorer: BlockExplorer
  currency: {
    id: string
    decimals: number
    symbol: string
  }
  onPurchased: () => void
  multiple?: boolean
}

const OfferFormCheckout: FC<Props> = ({
  signer,
  account,
  currency,
  onPurchased,
  multiple,
  asset,
  offer,
  chainId,
  blockExplorer,
}) => {
  const { t } = useTranslation('components')
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

  const buyWithCard = useCallback(() => {
    if (!account) return
    if (!asset) return
    const signedData = signSmartContractData(
      {
        commodity: 'MATIC',
        commodity_amount: 100,
        network: 'mumbai',
        address: account,
        sc_address: '0x7A4c9573c4c0609CDE08290B01B0e5365932292B',
        sc_input_data:
          'e99a3f800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000004e000000000000000000000000000000000000000000000000000000000000008400000000000000000000000004b595014f7b45789c3f4e79324ae6d8090a6c8b500000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020048feff1e0d1c0583dddd75f84117889438a5f850bdbf40dacac176028cdb14f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006550e8704c2342660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000173ad21460000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000f503266aa28ac2ec8fcd6fbddc7ea7baa9a1854400000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000009184e72a000aaaebeba00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000003fe30e620683dfec32d4bd8f1801512357a0356e00000000000000000000000000000000000000000000000000000000000000640000000000000000000000004b595014f7b45789c3f4e79324ae6d8090a6c8b500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041763217b6e470303568c513bf0fbb9dbe48e85d11e554b767b2d4723b70c71690104a5cdb2675c7033ae47928610ed26b4160d62ff5bdfadf3cd0521279fb39a51b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000b5a15932be6caeef5d21ac704300bd45e10ff92d00000000000000000000000000000000000000000000000000000000000001200000000000000000000000004b595014f7b45789c3f4e79324ae6d8090a6c8b500000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006550e8704c2342660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000009184e72a000aaaebeba00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000173ad21460000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000f503266aa28ac2ec8fcd6fbddc7ea7baa9a18544000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      },
      '0xb32ea80944b508205e90427e0efe2be29a53b8a2afe44bb80162e494e78d6864',
    )

    const widget = new WertWidget({
      ...signedData,
      partner_id: '01HAVHNY5RBDZ8T2G1MJ0QSN2D',
      origin: 'https://sandbox.wert.io',
      extra: {
        item_info: {
          author_image_url: asset.creator?.image,
          author: asset.creator?.name || asset.creator?.address,
          image_url: asset.image,
          name: asset.name,
          seller: offer.maker.name || offer.maker.address,
        },
      },
      click_id: Math.random(),
    })
    widget.mount()
  }, [account, asset, offer])

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
      <div>
        <Summary
          currency={currency}
          price={priceUnit}
          quantity={quantityBN}
          isSingle={!multiple}
          noFees
        />
      </div>

      {account && <Balance account={account} currency={currency} />}

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
        chainId={chainId}
        // isDisabled={!canPurchase}
        isLoading={isSubmitting}
        size="lg"
        type="submit"
      >
        <Text as="span" isTruncated>
          {t('offer.form.checkout.submit')}
        </Text>
      </ConnectButtonWithNetworkSwitch>

      <Button onClick={buyWithCard}>Buy with card</Button>

      {/* <WertModule options={this.state.wertOptions} /> */}

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
