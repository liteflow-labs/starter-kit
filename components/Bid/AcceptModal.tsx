import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
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
  VStack,
} from '@chakra-ui/react'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { FaImages } from '@react-icons/all-files/fa/FaImages'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

export type Props = {
  isOpen: boolean
  onClose: () => void
  bid: {
    id: string
    availableQuantity: BigNumber
  }
  totalOwned: BigNumber
  acceptBid: (quantity?: BigNumberish) => Promise<void>
}

const BidAcceptModal: FC<Props> = ({
  bid,
  acceptBid,
  isOpen,
  onClose,
  totalOwned,
}) => {
  const { t } = useTranslation('components')

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
  const maxQuantity = useMemo(
    () =>
      totalOwned.lt(bid.availableQuantity) ? totalOwned : bid.availableQuantity,
    [bid, totalOwned],
  )

  useEffect(
    () => setValue('quantity', maxQuantity.toString()),
    [maxQuantity, setValue],
  )

  const submitAcceptBid = handleSubmit(async (data) => acceptBid(data.quantity))

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('bid.modal.accept.title')}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={submitAcceptBid}>
          <ModalBody>
            <VStack spacing="4" align="start">
              <Text>{t('bid.modal.accept.description')}</Text>
              {bid.availableQuantity.gt(1) && (
                <FormControl isInvalid={!!errors.quantity}>
                  <HStack spacing={1} mb={2}>
                    <FormLabel htmlFor="quantity" m={0}>
                      {t('bid.modal.accept.quantity.label')}
                    </FormLabel>
                    <FormHelperText m={0}>
                      {t('bid.modal.accept.quantity.suffix')}
                    </FormHelperText>
                  </HStack>
                  <InputGroup>
                    <NumberInput
                      clampValueOnBlur={false}
                      min={1}
                      max={
                        maxQuantity.lte(Number.MAX_SAFE_INTEGER - 1)
                          ? maxQuantity.toNumber()
                          : Number.MAX_SAFE_INTEGER - 1
                      }
                      allowMouseWheel
                      w="full"
                      onChange={(x) => setValue('quantity', x)}
                    >
                      <NumberInputField
                        id="quantity"
                        placeholder={t('bid.modal.accept.quantity.placeholder')}
                        {...register('quantity', {
                          required: t('bid.modal.accept.validation.required'),
                          validate: (value) => {
                            const valueBN = BigNumber.from(value)
                            if (valueBN.lt(1) || valueBN.gt(maxQuantity)) {
                              return t('bid.modal.accept.validation.in-range', {
                                max: maxQuantity.toString(),
                              })
                            }
                            if (!/^\d+$/.test(value)) {
                              return t('bid.modal.accept.validation.integer')
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
                      {t('bid.modal.accept.quantity.available', {
                        count: bid.availableQuantity.toString(),
                      })}
                    </Text>
                  </FormHelperText>
                </FormControl>
              )}

              <Flex
                display="inline-flex"
                wrap="wrap"
                align="center"
                rounded="full"
                py={2}
                px={4}
                bgColor="brand.50"
              >
                <Icon as={FaImages} color="brand.black" mr={3} h={4} w={4} />
                <Heading as="span" variant="heading3" color="gray.500" mr={2}>
                  {t('bid.modal.accept.owned.label')}
                </Heading>
                <Heading as="h5" variant="heading3" color="brand.black">
                  <Text fontWeight="semibold">
                    {t('bid.modal.accept.owned.unit', {
                      count: totalOwned.lte(Number.MAX_SAFE_INTEGER - 1)
                        ? totalOwned.toNumber()
                        : Number.MAX_SAFE_INTEGER - 1,
                    })}
                  </Text>
                </Heading>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button isLoading={isSubmitting} size="lg" type="submit">
              <Text as="span" isTruncated>
                {t('bid.modal.accept.submit')}
              </Text>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default BidAcceptModal
