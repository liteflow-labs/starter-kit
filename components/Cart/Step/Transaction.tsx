import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Divider,
  DrawerBody,
  DrawerFooter,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { sendTransaction } from '@liteflow/core/dist/utils/transaction'
import { FaAngleLeft } from '@react-icons/all-files/fa/FaAngleLeft'
import { FaCheck } from '@react-icons/all-files/fa/FaCheck'
import { ContractReceipt } from 'ethers'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import {
  useCreateApprovalMutation,
  useCreateCartPurchaseTransactionMutation,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import { CartItem } from '../../../hooks/useCart'
import useSigner from '../../../hooks/useSigner'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import List, { ListItem } from '../../List/List'
import Price from '../../Price/Price'
import CartItemSummary from '../ItemSummary'

type Props = {
  cartItems: CartItem[]
  chainId: number
  onSubmit: (receipt: ContractReceipt) => void
  onCancel: () => void
  onError: (error: Error) => void
}

const CartStepTransaction: FC<Props> = ({
  cartItems,
  chainId,
  onSubmit,
  onCancel,
  onError,
}) => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const { address } = useAccount()
  const approvalItems = useMemo(
    () =>
      cartItems.map((x) => ({
        offerId: x.offerId,
        fillQuantity: BigNumber.from(x.quantity || 1).toString(),
      })),
    [cartItems],
  )
  const [fetchApproval, { loading, data, called }] = useCreateApprovalMutation()

  const [fetchCartTransaction] = useCreateCartPurchaseTransactionMutation()
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    if (!address) return
    void fetchApproval({
      variables: { accountAddress: address, items: approvalItems },
    })
  }, [address, approvalItems, fetchApproval])

  const allApproved = useMemo(
    () =>
      data?.createCheckoutApprovalTransactions
        .map((x) => x.transaction)
        .filter(Boolean).length === 0,
    [data],
  )

  const [approvalLoading, setApprovalLoading] = useState<{
    [key: string]: boolean
  }>({})

  const approve = useCallback(
    async (currencyId: string, tx: any) => {
      invariant(signer, 'signer is required')
      invariant(address, 'address is required')
      try {
        setApprovalLoading((x) => ({ ...x, [currencyId]: true }))
        const transaction = await sendTransaction(signer, tx)
        await transaction.wait()
        await fetchApproval({
          variables: { accountAddress: address, items: approvalItems },
        })
      } finally {
        setApprovalLoading((x) => ({ ...x, [currencyId]: false }))
      }
    },
    [signer, fetchApproval, address, approvalItems],
  )

  const submit = useCallback(async () => {
    invariant(address)
    invariant(signer)
    if (!address) return
    try {
      setBuying(true)
      const items = cartItems.map((x) => ({
        offerId: x.offerId,
        fillQuantity: BigNumber.from(x.quantity || 1).toString(),
      }))
      const res = await fetchCartTransaction({
        variables: { accountAddress: address, items: items },
      })
      invariant(res.data)
      const tx = res.data.createCheckoutTransaction.transaction as any
      invariant(tx)
      const transaction = await sendTransaction(signer, tx)
      const receipt = await transaction.wait()
      onSubmit(receipt)
    } catch (e) {
      onError(e as Error)
    } finally {
      setBuying(false)
    }
  }, [address, fetchCartTransaction, cartItems, onSubmit, signer, onError])

  if (loading) return <DrawerBody py={4} px={2} />

  if (called && data?.createCheckoutApprovalTransactions.length === 0)
    return (
      <DrawerBody py={4} px={2}>
        <VStack px={2} alignItems="flex-start" width="full">
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            <Box fontSize="sm">
              <AlertTitle>{t('cart.step.transaction.empty.title')}</AlertTitle>
              <AlertDescription fontSize="xs">
                {t('cart.step.transaction.empty.description')}
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </DrawerBody>
    )

  return (
    <>
      <DrawerBody py={4} px={2}>
        <VStack px={2} alignItems="flex-start" width="full" spacing={3}>
          <CartItemSummary cartItems={cartItems} chainId={chainId} />
          <Text variant="subtitle2">
            {t('cart.step.transaction.summary.price')}
          </Text>
          <List width="full">
            {data?.createCheckoutApprovalTransactions.map((item, i) => (
              <ListItem
                key={i}
                label={
                  <Price
                    amount={item.amount}
                    currency={{
                      // id: item.currencyId,
                      decimals: 18,
                      symbol: 'xxx',
                    }}
                  />
                }
                action={
                  item.transaction ? (
                    <ConnectButtonWithNetworkSwitch
                      chainId={chainId}
                      onClick={() => approve(item.currencyId, item.transaction)}
                      isLoading={approvalLoading[item.currencyId] || false}
                    >
                      {t('cart.step.transaction.button.approve', {
                        value: 'xxx',
                      })}
                    </ConnectButtonWithNetworkSwitch>
                  ) : (
                    <Icon as={FaCheck} color="green.400" />
                  )
                }
                p={0}
              />
            ))}
          </List>
        </VStack>
      </DrawerBody>
      <Divider />
      <DrawerFooter width="full">
        <HStack gap={0} width="full">
          <IconButton
            aria-label={t('cart.step.transaction.button.aria-label')}
            icon={<Icon as={FaAngleLeft} boxSize={5} />}
            borderRightRadius="none"
            onClick={() => onCancel()}
          />
          <Divider orientation="vertical" />
          <ConnectButtonWithNetworkSwitch
            chainId={chainId}
            isDisabled={!allApproved}
            isLoading={buying}
            flexGrow={1}
            borderLeftRadius="none"
            onClick={() => submit()}
          >
            {t('cart.step.transaction.button.purchase')}
          </ConnectButtonWithNetworkSwitch>
        </HStack>
      </DrawerFooter>
    </>
  )
}

export default CartStepTransaction
