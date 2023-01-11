import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import {
  AcceptOfferStep,
  CancelOfferStep,
  dateFromNow,
  formatDate,
  isSameAddress,
  useAcceptOffer,
  useCancelOffer,
} from '@nft/hooks'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { SyntheticEvent, useEffect, useMemo, VFC } from 'react'
import { useForm } from 'react-hook-form'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
import Link from '../Link/Link'
import { ListItem } from '../List/List'
import AcceptOfferModal from '../Modal/AcceptOffer'
import CancelOfferModal from '../Modal/CancelOffer'
import Price from '../Price/Price'
import WalletAddress from '../Wallet/Address'
import AccountImage from '../Wallet/Image'

export type Props = {
  bid: {
    id: string
    createdAt: Date
    expiredAt: Date | null | undefined
    unitPrice: BigNumber
    availableQuantity: BigNumber
    currency: {
      decimals: number
      symbol: string
    }
    maker: {
      address: string
      name: string | null | undefined
      image: string | null | undefined
      verified: boolean
    }
  }
  signer: Signer | undefined
  account: string | null | undefined
  blockExplorer: BlockExplorer
  isSingle: boolean
  preventAcceptation: boolean
  onAccepted: (id: string) => Promise<void>
  onCanceled: (id: string) => Promise<void>
}

const Bid: VFC<Props> = ({
  bid,
  signer,
  account,
  blockExplorer,
  isSingle,
  preventAcceptation,
  onAccepted,
  onCanceled,
}) => {
  const { t } = useTranslation('components')
  const {
    isOpen: acceptOfferIsOpen,
    onOpen: acceptOfferOnOpen,
    onClose: acceptOfferOnClose,
  } = useDisclosure()
  const {
    isOpen: cancelOfferIsOpen,
    onOpen: cancelOfferOnOpen,
    onClose: cancelOfferOnClose,
  } = useDisclosure()
  const {
    isOpen: confirmCancelIsOpen,
    onOpen: confirmCancelOnOpen,
    onClose: confirmCancelOnClose,
  } = useDisclosure()
  const {
    isOpen: confirmAcceptIsOpen,
    onOpen: confirmAcceptOnOpen,
    onClose: confirmAcceptOnClose,
  } = useDisclosure()

  const [
    acceptOffer,
    { activeStep: activeAcceptOfferStep, transactionHash: acceptOfferHash },
  ] = useAcceptOffer(signer)
  const [
    cancelOffer,
    { activeStep: activeCancelOfferStep, transactionHash: cancelOfferHash },
  ] = useCancelOffer(signer)

  const canAccept = useMemo(() => {
    if (!account) return false
    if (preventAcceptation) return false
    return !isSameAddress(bid.maker.address, account)
  }, [account, bid, preventAcceptation])

  const canCancel = useMemo(() => {
    if (!account) return false
    return isSameAddress(account, bid.maker.address)
  }, [account, bid])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<{ quantity: string }>({
    defaultValues: {
      quantity: bid.availableQuantity.toString(),
    },
  })
  useEffect(
    () => setValue('quantity', bid.availableQuantity.toString()),
    [bid.availableQuantity, setValue],
  )

  const acceptBid = async (quantity?: BigNumberish) => {
    if (!canAccept) return
    if (activeAcceptOfferStep !== AcceptOfferStep.INITIAL) return
    try {
      acceptOfferOnOpen()
      confirmAcceptOnClose()
      await acceptOffer(bid, quantity || bid.availableQuantity)
      await onAccepted(bid.id)
    } finally {
      acceptOfferOnClose()
    }
  }
  const submitAcceptBid = handleSubmit(async (data) => acceptBid(data.quantity))

  const cancelBid = async (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!canCancel) return
    if (activeCancelOfferStep !== CancelOfferStep.INITIAL) return
    try {
      cancelOfferOnOpen()
      await cancelOffer(bid)
      await onCanceled(bid.id)
    } finally {
      cancelOfferOnClose()
    }
  }

  return (
    <>
      <ListItem
        image={
          <Link href={`/users/${bid.maker.address}`}>
            <Flex
              as={AccountImage}
              address={bid.maker.address}
              image={bid.maker.image}
              size={40}
              cursor="pointer"
            />
          </Link>
        }
        label={
          <Flex gap={2}>
            <span>
              <Trans
                ns="components"
                i18nKey={
                  isSingle
                    ? 'bid.detail.per-edition-single'
                    : 'bid.detail.per-edition-multiple'
                }
                components={[
                  <Text
                    as={Price}
                    amount={bid.unitPrice}
                    currency={bid.currency}
                    color="black"
                    fontWeight="medium"
                    key="price"
                  />,
                ]}
              />
            </span>
            {!isSingle && (
              <Flex as="span">
                <Divider orientation="vertical" />
                <span>
                  <Trans
                    ns="components"
                    i18nKey="bid.detail.requested"
                    components={[
                      <Text
                        as="span"
                        ml={2}
                        color="black"
                        fontWeight="medium"
                        key="quantity"
                      />,
                    ]}
                    values={{ quantity: bid.availableQuantity.toString() }}
                  />
                </span>
              </Flex>
            )}
          </Flex>
        }
        subtitle={
          <Link href={`/users/${bid.maker.address}`}>
            <Flex as="span" align="center" gap={1.5} cursor="pointer">
              <Text
                as="span"
                title={bid.maker.name || bid.maker.address}
                fontWeight="medium"
                color="black"
                fontSize="sm"
              >
                {bid.maker.name || (
                  <WalletAddress address={bid.maker.address} isShort />
                )}
              </Text>
              {bid.maker.verified && (
                <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
              )}
            </Flex>
          </Link>
        }
        caption={
          <Text as="span" color="gray.400">
            {dateFromNow(bid.createdAt)}
            {bid.expiredAt &&
              t('bid.detail.expires', { date: formatDate(bid.expiredAt) })}
          </Text>
        }
        action={
          <>
            {canAccept && (
              <Button
                w={{ base: 'full', md: 'auto' }}
                isLoading={activeAcceptOfferStep !== AcceptOfferStep.INITIAL}
                onClick={() =>
                  bid.availableQuantity.gt(1)
                    ? confirmAcceptOnOpen()
                    : acceptBid()
                }
              >
                <Text as="span" isTruncated>
                  {t('bid.detail.accept')}
                </Text>
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                colorScheme="gray"
                w={{ base: 'full', md: 'auto' }}
                isLoading={activeCancelOfferStep !== CancelOfferStep.INITIAL}
                onClick={confirmCancelOnOpen}
              >
                <Text as="span" isTruncated>
                  {t('bid.detail.cancel')}
                </Text>
              </Button>
            )}
          </>
        }
      />

      <AcceptOfferModal
        isOpen={acceptOfferIsOpen}
        onClose={acceptOfferOnClose}
        title={t('bid.detail.modal.accept.title')}
        step={activeAcceptOfferStep}
        blockExplorer={blockExplorer}
        transactionHash={acceptOfferHash}
      />
      <CancelOfferModal
        isOpen={cancelOfferIsOpen}
        onClose={cancelOfferOnClose}
        title={t('bid.detail.modal.cancel.title')}
        step={activeCancelOfferStep}
        blockExplorer={blockExplorer}
        transactionHash={cancelOfferHash}
      />
      {/* Confirm to accept offer */}
      <Modal onClose={confirmAcceptOnClose} isOpen={confirmAcceptIsOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Accept bid</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={submitAcceptBid}>
            <ModalBody>
              {bid.availableQuantity.gt(1) && (
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
                      max={bid.availableQuantity.toNumber()}
                      allowMouseWheel
                      w="full"
                      onChange={(x) => setValue('quantity', x)}
                    >
                      <NumberInputField
                        id="quantity"
                        placeholder={t(
                          'offer.form.checkout.quantity.placeholder',
                        )}
                        {...register('quantity', {
                          required: t(
                            'offer.form.checkout.validation.required',
                          ),
                          validate: (value) => {
                            if (
                              parseInt(value, 10) < 1 ||
                              parseInt(value, 10) >
                                bid.availableQuantity.toNumber()
                            ) {
                              return t(
                                'offer.form.checkout.validation.in-range',
                                { max: bid.availableQuantity.toNumber() },
                              )
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
                    <FormErrorMessage>
                      {errors.quantity.message}
                    </FormErrorMessage>
                  )}
                  <FormHelperText>
                    <Text as="p" variant="text" color="gray.500">
                      {t('offer.form.checkout.available', {
                        count: bid.availableQuantity.toNumber(),
                      })}
                    </Text>
                  </FormHelperText>
                </FormControl>
              )}
            </ModalBody>
            <ModalFooter>
              <Button isLoading={isSubmitting} size="lg" type="submit">
                <Text as="span" isTruncated>
                  {t('offer.form.checkout.submit')}
                </Text>
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      {/* Confirm to cancel offer */}
      <Modal onClose={confirmCancelOnClose} isOpen={confirmCancelIsOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm to cancel the offer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure to cancel this offer</ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={(e) => {
                confirmCancelOnClose()
                void cancelBid(e)
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Bid
