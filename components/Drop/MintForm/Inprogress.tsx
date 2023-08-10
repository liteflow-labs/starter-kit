import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import ConnectButtonWithNetworkSwitch from 'components/Button/ConnectWithNetworkSwitch'
import useAccount from 'hooks/useAccount'
import useBlockExplorer from 'hooks/useBlockExplorer'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import numbro from 'numbro'
import { FC, JSX, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { formatError } from '../../../utils'
import Countdown from '../../Countdown/Countdown'
import Image from '../../Image/Image'
import MintDropModal, { MintDropStep } from '../../Modal/MintDrop'
import Price from '../../Price/Price'

type FormData = {
  quantity: number
}

type Props = {
  collection: {
    address: string
    chainId: number
  }
  drop: {
    id: string
    name: string
    endDate: Date
    unitPrice: string
    minted: string
    supply: string | null
    maxQuantityPerWallet: string | null
    isAllowed: boolean
    maxQuantity: string | null
    currency: {
      decimals: number
      symbol: string
      image: string
    }
  }
}

const MintFormInprogress: FC<Props> = ({ collection, drop }): JSX.Element => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const { push } = useRouter()
  const { address } = useAccount()
  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: { quantity: 1 },
    mode: 'all',
  })

  const quantity = watch('quantity')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const blockExplorer = useBlockExplorer(collection.chainId)

  const mintedOut = useMemo(() => {
    if (!drop.supply) return false
    return BigNumber.from(drop.minted).gte(BigNumber.from(drop.supply))
  }, [drop.minted, drop.supply])

  const onSubmit = handleSubmit(async (data) => {
    try {
      onOpen()
      // TODO: to be removed and changed after adding useMintDrop hook to the SDK
      console.log(data)
      // await mintDrop({
      //   dropId: drop.id,
      //   chainId: collection.chainId,
      //   collectionAddress: collection.address,
      //   quantity: data.quantity.toString(),
      // })
      await push(`/users/${address}`)
      toast({
        title: 'NFT was successfully minted',
        status: 'success',
      })
    } catch (error) {
      toast({
        title: formatError(error),
        status: 'error',
      })
    } finally {
      onClose()
    }
  })

  return (
    <>
      <Box
        borderWidth={{ base: '0px', sm: '1px' }}
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="grayAlpha.700"
        borderRadius={{ base: 'none', sm: '2xl' }}
        width="full"
        overflow="hidden"
      >
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
          width="full"
          p={4}
          bg="grayAlpha.800"
          alignItems="center"
        >
          <Flex flexDirection="column" gap={1} width="full">
            <Heading variant="headline5" title={drop.name} noOfLines={1}>
              {drop.name}
            </Heading>
            <HStack alignItems="center" spacing={1}>
              <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
                Price:
              </Text>
              <Image
                src={drop.currency.image}
                alt={drop.currency.symbol}
                width={12}
                height={12}
                w={3}
                h={3}
              />
              <Text variant="subtitle2">
                <Price amount={drop.unitPrice} currency={drop.currency} />
              </Text>
            </HStack>
            {drop.supply && (
              <HStack alignItems="center" spacing={1}>
                <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
                  Supply:
                </Text>
                <Text variant="subtitle2">
                  {numbro(drop.supply).format({
                    thousandSeparated: true,
                  })}
                </Text>
              </HStack>
            )}
            {drop.maxQuantityPerWallet && (
              <HStack alignItems="center" spacing={1}>
                <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
                  Mint limit:
                </Text>
                <Text variant="subtitle2">
                  {numbro(drop.maxQuantityPerWallet).format({
                    thousandSeparated: true,
                  })}{' '}
                  per wallet
                </Text>
              </HStack>
            )}
          </Flex>
          <Flex flexDirection="column" alignItems="flex-end" gap={3} w="full">
            <Flex as="form" onSubmit={onSubmit} noValidate w="full" gap={3}>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                bg="grayAlpha.900"
                rounded="full"
                p={2}
                flex={{ base: 1, md: 'none' }}
              >
                <Button
                  display="flex"
                  variant="unstyled"
                  size="xs"
                  onClick={() => setValue('quantity', quantity - 1)}
                  isDisabled={quantity === 1}
                >
                  -
                </Button>
                <Text variant="body2" minWidth={8} textAlign="center">
                  {quantity}
                </Text>
                <Button
                  display="flex"
                  variant="unstyled"
                  size="xs"
                  onClick={() => setValue('quantity', quantity + 1)}
                  isDisabled={
                    drop.maxQuantity
                      ? BigNumber.from(quantity).gte(
                          BigNumber.from(drop.maxQuantity),
                        )
                      : false
                  }
                >
                  +
                </Button>
              </Flex>
              <ConnectButtonWithNetworkSwitch
                chainId={collection.chainId}
                type="submit"
                flex={1}
                isLoading={isSubmitting}
                isDisabled={
                  !drop.isAllowed ||
                  (drop.maxQuantity
                    ? BigNumber.from(drop.maxQuantity).eq(0)
                    : false) ||
                  mintedOut
                }
              >
                <Text as="span" isTruncated>
                  {t('bid.detail.accept')}
                </Text>
              </ConnectButtonWithNetworkSwitch>
            </Flex>
            {!drop.isAllowed && (
              <Text variant="caption">
                You’re not eligible for this mint stage
              </Text>
            )}
          </Flex>
        </SimpleGrid>
        <Divider />
        <Flex alignItems="center" justifyContent="center" px={4} py={3}>
          <Text variant="subtitle2">
            Ends in <Countdown date={drop.endDate} />
          </Text>
        </Flex>
      </Box>
      {/* TODO: to be changed after adding useMintDrop hook to the SDK  */}
      <MintDropModal
        isOpen={isOpen}
        onClose={onClose}
        step={MintDropStep.INITIAL}
        blockExplorer={blockExplorer}
        transactionHash={''}
      />
    </>
  )
}

export default MintFormInprogress
