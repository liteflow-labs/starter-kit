import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import WalletAddress from '../Address'
import WalletBalanceList from './WalletBalanceList'

const WalletAccount: FC<{
  account: string
  currencies: {
    name: string
    id: string
    image: string
    decimals: number
    symbol: string
  }[]
  networkName: string
}> = ({ account, currencies, networkName }) => {
  const { t } = useTranslation('components')

  return (
    <Stack spacing={12} pt={12}>
      <Stack spacing={6}>
        <div>
          <Heading as="h2" variant="subtitle" color="brand.black">
            {t('wallet.wallet.deposit.title')}
          </Heading>
          <Text as="p" variant="text" color="gray.500">
            {t('wallet.wallet.deposit.description')}
          </Text>
        </div>
        <Button variant="outline" colorScheme="gray" isFullWidth>
          <Text as="span" isTruncated>
            <WalletAddress address={account} isCopyable />
          </Text>
        </Button>
        <Alert status="warning" borderRadius="xl">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertTitle>
              {t('wallet.wallet.banner.title', { networkName })}
            </AlertTitle>
            <AlertDescription>
              {t('wallet.wallet.banner.description', { networkName })}
            </AlertDescription>
          </Box>
        </Alert>
      </Stack>
      <hr />
      <Stack spacing={6}>
        <Heading as="h2" variant="subtitle" color="brand.black">
          {t('wallet.wallet.balances')}
        </Heading>
        <WalletBalanceList currencies={currencies} account={account} />
      </Stack>
    </Stack>
  )
}

export default WalletAccount
