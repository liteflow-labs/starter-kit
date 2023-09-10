import { Flex, Icon, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FaLongArrowAltRight } from '@react-icons/all-files/fa/FaLongArrowAltRight'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import Trans from 'next-translate/Trans'
import { FC } from 'react'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
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
    image: string | null
    verified: boolean
  } | null
  toAddress: string
  to: {
    name: string | null
    image: string | null
    verified: boolean
  } | null
  transactionHash: string | null
  blockExplorer: BlockExplorer
}

const TransferListItem: FC<IProps> = ({
  date,
  fromAddress,
  from,
  quantity,
  toAddress,
  to,
  transactionHash,
  blockExplorer,
}) => {
  return (
    <ListItem
      image={<Icon as={FaLongArrowAltRight} h={5} w={5} color="gray.400" />}
      label={
        <Trans
          ns="components"
          i18nKey="history.transfer.transferred"
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
            <Flex
              as={Link}
              display="inline-flex"
              align="center"
              gap={1.5}
              href={`/users/${toAddress}`}
              key="to"
            >
              <Text
                as="span"
                title={to?.name || toAddress}
                color="brand.black"
                fontWeight="medium"
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
      subtitle={
        <Trans
          ns="components"
          i18nKey="history.transfer.from"
          components={[
            <Flex
              as={Link}
              display="inline-flex"
              align="center"
              gap={1.5}
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
        <Flex align="center" color="gray.400" as="span">
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

export default TransferListItem
