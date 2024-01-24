import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
  DrawerBody,
  DrawerFooter,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { sendTransaction } from '@liteflow/core/dist/utils/transaction'
import { BatchPurchaseStep } from '@liteflow/react/dist/useBatchPurchase'
import { FaAngleLeft } from '@react-icons/all-files/fa/FaAngleLeft'
import { FaCheck } from '@react-icons/all-files/fa/FaCheck'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import { useCreateApprovalMutation } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBalances from '../../../hooks/useBalances'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useCart, { CartItem } from '../../../hooks/useCart'
import useSigner from '../../../hooks/useSigner'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import List, { ListItem } from '../../List/List'
import BatchPurchaseModal from '../../Modal/BatchPurchase'
import Price, { formatPrice } from '../../Price/Price'
import CartItemSummary from '../ItemSummary'

type Props = {
  cartItems: CartItem[]
  chainId: number
  onSubmit: () => void
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
  const { checkout, activeStep, transactionHash } = useCart()
  const { address } = useAccount()
  const blockExplorer = useBlockExplorer(chainId)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const approvalItems = useMemo(
    () =>
      cartItems.map((x) => ({
        offerId: x.offerId,
        fillQuantity: BigNumber.from(x.quantity || 1).toString(),
      })),
    [cartItems],
  )
  const [fetchApproval, { loading: loadingApproval, data, called }] =
    useCreateApprovalMutation()

  const allCurrencies = useMemo(
    () =>
      data?.createCheckoutApprovalTransactions.map((x) => x.currency.id) || [],
    [data],
  )

  const [balances, { loading: loadingBalance }] = useBalances(
    address,
    allCurrencies,
  )

  const loading = useMemo(
    () =>
      activeStep !== BatchPurchaseStep.INITIAL ||
      loadingBalance ||
      loadingApproval,
    [activeStep, loadingApproval, loadingBalance],
  )

  const hasEnoughBalance = useMemo(
    () =>
      data?.createCheckoutApprovalTransactions.every((x) => {
        const balance = balances[x.currency.id]
        return balance && balance.gte(x.amount)
      }) || false,
    [data, balances],
  )

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
    if (!address) return
    try {
      onOpen()
      await checkout(cartItems)
      onSubmit()
    } catch (e) {
      onError(e as Error)
    } finally {
      onClose()
    }
  }, [address, cartItems, checkout, onClose, onError, onOpen, onSubmit])

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
                label={<Price amount={item.amount} currency={item.currency} />}
                action={
                  loading ? (
                    <Button size="sm" variant="ghost" isLoading isDisabled />
                  ) : item.transaction ? (
                    <ConnectButtonWithNetworkSwitch
                      chainId={chainId}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        approve(item.currency.id, item.transaction)
                      }
                      isLoading={approvalLoading[item.currency.id] || false}
                    >
                      {t('cart.step.transaction.button.approve', {
                        value: formatPrice(item.amount, item.currency),
                      })}
                    </ConnectButtonWithNetworkSwitch>
                  ) : balances[item.currency.id] &&
                    balances[item.currency.id]?.gt(item.amount) ? (
                    <Icon as={FaCheck} color="green.400" />
                  ) : (
                    <Text color="red.400" size="sm">
                      {t('cart.step.transaction.button.insufficient')}
                    </Text>
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
            isDisabled={!allApproved || !hasEnoughBalance || loading}
            isLoading={loading}
            flexGrow={1}
            borderLeftRadius="none"
            onClick={() => submit()}
          >
            {loading
              ? ''
              : hasEnoughBalance
                ? t('cart.step.transaction.button.purchase')
                : t('cart.step.transaction.button.insufficient')}
          </ConnectButtonWithNetworkSwitch>
        </HStack>
      </DrawerFooter>
      <BatchPurchaseModal
        isOpen={isOpen}
        onClose={onClose}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </>
  )
}

export default CartStepTransaction
