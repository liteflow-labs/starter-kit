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
import { useMintDrop } from '@liteflow/react'
import ConnectButtonWithNetworkSwitch from 'components/Button/ConnectWithNetworkSwitch'
import useAccount from 'hooks/useAccount'
import useBlockExplorer from 'hooks/useBlockExplorer'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import numbro from 'numbro'
import { FC, JSX, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import useSigner from '../../../hooks/useSigner'
import { formatError } from '../../../utils'
import Countdown from '../../Countdown/Countdown'
import Image from '../../Image/Image'
import MintDropModal from '../../Modal/MintDrop'
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

  const signer = useSigner()
  const [mintDrop, { activeStep, transactionHash }] = useMintDrop(signer)

  const quantity = watch('quantity')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const blockExplorer = useBlockExplorer(collection.chainId)

  const mintedOut = useMemo(() => {
    if (!drop.supply) return false
    return BigNumber.from(drop.minted).gte(drop.supply)
  }, [drop.minted, drop.supply])

  const onSubmit = handleSubmit(async (data) => {
    try {
      onOpen()
      const mintedDrops = await mintDrop(drop.id, data.quantity)
      invariant(mintedDrops[0], 'Error minting drop')
      mintedDrops.length === 1
        ? await push(
            `/tokens/${mintedDrops[0].chain}-${mintedDrops[0].collection}-${mintedDrops[0].token}`,
          )
        : await push(`/users/${address}/owned`)
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
        borderWidth="1px"
        borderRadius="2xl"
        bg="brand.50"
        width="full"
        overflow="hidden"
      >
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
          width="full"
          p={4}
          alignItems="center"
        >
          <Flex flexDirection="column" gap={1} width="full">
            <Heading variant="heading2" title={drop.name} noOfLines={1}>
              {drop.name}
            </Heading>
            <HStack alignItems="center" spacing={1}>
              <Text variant="subtitle2" color="gray.500" mr={2}>
                {t('drop.form.in-progress.price')}
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
                <Text variant="subtitle2" color="gray.500" mr={2}>
                  {t('drop.form.in-progress.supply')}
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
                <Text variant="subtitle2" color="gray.500" mr={2}>
                  {t('drop.form.in-progress.mintLimit')}
                </Text>
                <Text variant="subtitle2">
                  {t('drop.form.in-progress.limit', {
                    maxQuantityPerWallet: numbro(
                      drop.maxQuantityPerWallet,
                    ).format({
                      thousandSeparated: true,
                    }),
                  })}
                </Text>
              </HStack>
            )}
          </Flex>
          <Flex flexDirection="column" alignItems="flex-end" gap={3} w="full">
            <Flex as="form" onSubmit={onSubmit} noValidate w="full" gap={3}>
              <Flex alignItems="center" gap={2}>
                <Button
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
                  {mintedOut
                    ? t('drop.form.in-progress.mintedOut')
                    : t('drop.form.in-progress.mint')}
                </Text>
              </ConnectButtonWithNetworkSwitch>
            </Flex>
            {!drop.isAllowed && (
              <Text variant="caption" color="gray.500">
                {t('drop.form.in-progress.notEligible')}
              </Text>
            )}
          </Flex>
        </SimpleGrid>
        <Divider />
        <Flex alignItems="center" justifyContent="center" px={4} py={3}>
          <Text variant="subtitle2">
            <Trans
              ns="components"
              i18nKey="drop.form.in-progress.endsIn"
              components={[<Countdown date={drop.endDate} key="countdown" />]}
            />
          </Text>
        </Flex>
      </Box>
      <MintDropModal
        isOpen={isOpen}
        onClose={onClose}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </>
  )
}

export default MintFormInprogress
