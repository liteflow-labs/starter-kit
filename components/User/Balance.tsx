import { Button, Flex, Heading, Icon, Text, VStack } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { useAddFund, useBalance } from '@nft/hooks'
import { IoWalletOutline } from '@react-icons/all-files/io5/IoWalletOutline'
import useTranslation from 'next-translate/useTranslation'
import React, { FC, HTMLAttributes, SyntheticEvent, useCallback } from 'react'
import Price from '../Price/Price'

const Balance: FC<
  HTMLAttributes<any> & {
    signer: Signer | undefined
    account: string | null | undefined
    currency: {
      id: string
      decimals: number
      symbol: string
    }
    allowTopUp?: boolean
  }
> = ({ signer, account, currency, allowTopUp }) => {
  const { t } = useTranslation('components')
  const [balance, { loading: balanceLoading }] = useBalance(
    account,
    currency?.id,
  )
  const [addFund, { loading: addingFunds }] = useAddFund(signer)

  const handleAddFund = useCallback(
    async (e: SyntheticEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (!signer) return
      void addFund()
    },
    [signer, addFund],
  )

  return (
    <VStack align="flex-start" spacing={4} mb={6}>
      <Flex
        display="inline-flex"
        wrap="wrap"
        align="center"
        rounded="full"
        py={2}
        px={4}
        bgColor="brand.50"
      >
        <Icon as={IoWalletOutline} color="brand.black" mr={3} h={4} w={4} />
        <Heading as="span" variant="heading3" color="gray.500" mr={2}>
          {t('user.balance.title')}
        </Heading>
        {balance && (
          <Heading as="h5" variant="heading3" color="brand.black">
            <Text
              as={Price}
              fontWeight="semibold"
              amount={balance}
              currency={currency}
            />
          </Heading>
        )}
      </Flex>
      {allowTopUp && !balanceLoading && (
        <Button isLoading={addingFunds} onClick={(e) => handleAddFund(e)}>
          <Text as="span" isTruncated>
            {t('user.balance.add-funds')}
          </Text>
        </Button>
      )}
    </VStack>
  )
}

export default Balance
