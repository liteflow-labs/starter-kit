import { Flex, Icon, Text } from '@chakra-ui/react'
import { FaBurn } from '@react-icons/all-files/fa/FaBurn'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { AccountVerificationStatus } from '../../../graphql'
import { formatDate } from '../../../utils'
import Link from '../../Link/Link'
import { ListItem } from '../../List/List'
import WalletAddress from '../../Wallet/Address'

type IProps = {
  date: Date
  quantity: string
  fromAddress: string
  from: {
    name: string | null
    image: string | null
    verification: {
      status: AccountVerificationStatus
    } | null
  } | null
}

const BurnListItem: FC<IProps> = ({ quantity, fromAddress, from, date }) => {
  const { t } = useTranslation('components')
  return (
    <ListItem
      px={0}
      image={<Icon as={FaBurn} h={5} w={5} color="gray.400" />}
      label={
        <Text as="span" color="brand.black" fontWeight="medium">
          {t('history.burn.quantity', { value: quantity })}
        </Text>
      }
      subtitle={
        <Trans
          ns="components"
          i18nKey="history.burn.by"
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
              {from?.verification?.status === 'VALIDATED' && (
                <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
              )}
            </Flex>,
          ]}
        />
      }
      caption={
        <Text as="span" color="gray.400">
          {formatDate(date)}
        </Text>
      }
    />
  )
}

export default BurnListItem
