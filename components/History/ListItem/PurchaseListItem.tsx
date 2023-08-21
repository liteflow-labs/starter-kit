import { Flex, Icon, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FaShoppingCart } from '@react-icons/all-files/fa/FaShoppingCart'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import Trans from 'next-translate/Trans'
import { FC } from 'react'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import { formatDate } from '../../../utils'
import Link from '../../Link/Link'
import { ListItem } from '../../List/List'
import Price from '../../Price/Price'
import WalletAddress from '../../Wallet/Address'

type IProps = {
  date: Date
  unitPrice: BigNumber
  quantity: BigNumber
  fromAddress: string
  from: {
    name: string | null
    image: string | null
    verified: boolean
  } | null
  toAddress: string
  to: {
    name: string | null
    image: string | null
    verified: boolean
  } | null
  currency: {
    decimals: number
    symbol: string
  } | null
  transactionHash: string | null
  blockExplorer: BlockExplorer
}

const PurchaseListItem: FC<IProps> = ({
  currency,
  fromAddress,
  from,
  quantity,
  date,
  toAddress,
  to,
  unitPrice,
  transactionHash,
  blockExplorer,
}) => {
  return (
    <ListItem
      image={<Icon as={FaShoppingCart} h={5} w={5} color="gray.400" />}
      label={
        <Trans
          ns="components"
          i18nKey="history.purchase.purchased"
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
            currency ? (
              <Text
                as={Price}
                amount={unitPrice}
                currency={currency}
                color="brand.black"
                fontWeight="medium"
              />
            ) : (
              <span>-</span>
            ),
          ]}
        />
      }
      subtitle={
        <Trans
          ns="components"
          i18nKey="history.purchase.from"
          components={[
            <Flex
              align="center"
              gap={1.5}
              as={Link}
              display="inline-flex"
              href={`/users/${fromAddress}`}
              key="from"
            >
              <Text
                as="span"
                color="brand.black"
                fontWeight="medium"
                title={from?.name || fromAddress}
              >
                {from?.name || <WalletAddress address={fromAddress} isShort />}
              </Text>
              {from?.verified && (
                <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
              )}
            </Flex>,
            <Flex
              align="center"
              gap={1.5}
              as={Link}
              display="inline-flex"
              href={`/users/${toAddress}`}
              key="to"
            >
              <Text
                as="span"
                color="brand.black"
                fontWeight="medium"
                title={to?.name || toAddress}
              >
                {to?.name || <WalletAddress address={toAddress} isShort />}
              </Text>
              {to?.verified && (
                <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
              )}
            </Flex>,
          ]}
        />
      }
      caption={
        <Flex as="span" align="center" color="gray.400">
          {formatDate(date)}
          {transactionHash && (
            <Flex
              as={Link}
              href={blockExplorer.transaction(transactionHash) || ''}
              isExternal
            >
              <Icon as={HiOutlineExternalLink} ml={1.5} h={4} w={4} />
            </Flex>
          )}
        </Flex>
      }
    />
  )
}

export default PurchaseListItem
