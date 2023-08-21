import { Flex, Icon, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { WiStars } from '@react-icons/all-files/wi/WiStars'
import Trans from 'next-translate/Trans'
import { FC } from 'react'
import { formatDate } from '../../../utils'
import Link from '../../Link/Link'
import { ListItem } from '../../List/List'
import WalletAddress from '../../Wallet/Address'

type IProps = {
  date: Date
  quantity: BigNumber
  fromAddress: string
  from: {
    name: string | null
    verified: boolean
  } | null
}

const LazyMintListItem: FC<IProps> = ({
  date,
  from,
  fromAddress,
  quantity,
}) => {
  return (
    <ListItem
      image={<Icon as={WiStars} h={5} w={5} color="gray.400" />}
      label={
        <Trans
          ns="components"
          i18nKey="history.lazymint.minted"
          values={{
            count: quantity.lte(Number.MAX_SAFE_INTEGER - 1)
              ? quantity.toNumber()
              : Number.MAX_SAFE_INTEGER - 1,
          }}
          components={[
            <Text
              as="span"
              color="brand.black"
              fontWeight="medium"
              key="text"
            />,
          ]}
        />
      }
      subtitle={
        <Trans
          ns="components"
          i18nKey="history.lazymint.by"
          components={[
            <Flex
              display="inline-flex"
              align="center"
              gap={1.5}
              as={Link}
              href={`/users/${fromAddress}`}
              key="from"
            >
              <Text
                as="span"
                title={from?.name || fromAddress}
                color="brand.black"
                fontWeight="medium"
              >
                {from?.name || <WalletAddress address={fromAddress} isShort />}
              </Text>
              {from?.verified && (
                <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
              )}
            </Flex>,
          ]}
        />
      }
      caption={
        <Flex as="span" align="center" color="gray.400">
          {formatDate(date)}
        </Flex>
      }
    />
  )
}

export default LazyMintListItem
