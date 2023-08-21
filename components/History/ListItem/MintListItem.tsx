import { Flex, Icon, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import { WiStars } from '@react-icons/all-files/wi/WiStars'
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
  toAddress: string
  to: {
    name: string | null
    image: string | null
    verified: boolean
  } | null
  transactionHash: string | null
  blockExplorer: BlockExplorer
}

const MintListItem: FC<IProps> = ({
  date,
  to,
  toAddress,
  quantity,
  transactionHash,
  blockExplorer,
}) => {
  return (
    <ListItem
      image={<Icon as={WiStars} h={5} w={5} color="gray.400" />}
      label={
        <Trans
          ns="components"
          i18nKey="history.mint.minted"
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
          i18nKey="history.mint.by"
          components={[
            <Flex
              display="inline-flex"
              align="center"
              gap={1.5}
              as={Link}
              href={`/users/${toAddress}`}
              key="link"
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

export default MintListItem
