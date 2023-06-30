import { Flex, Stack, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Image from '../../Image/Image'
import List, { ListItem } from '../../List/List'
import WalletBalance from './WalletBalance'

type IProps = {
  currencies: {
    name: string
    id: string
    image: string
    decimals: number
    symbol: string
  }[]
  account: string
}

const WalletBalanceList: FC<IProps> = ({ account, currencies }) => {
  const { t } = useTranslation('components')
  if (currencies.length === 0)
    return (
      <Text as="p" variant="text" color="gray.500">
        {t('wallet.balances.none')}
      </Text>
    )
  return (
    <Stack as={List} spacing={3}>
      {currencies.map((x, i, currenciesArr) => (
        <Flex
          as={ListItem}
          key={x.id}
          withSeparator={i < currenciesArr.length - 1}
          image={
            <Image
              src={x.image}
              alt={x.symbol}
              width={40}
              height={40}
              w={10}
              h={10}
              objectFit="cover"
            />
          }
          label={x.name}
          action={
            <Text as="span" color="brand.black" fontWeight="medium">
              <WalletBalance account={account} currency={x} />
            </Text>
          }
        />
      ))}
    </Stack>
  )
}

export default WalletBalanceList
