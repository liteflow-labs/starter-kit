import { Flex, Icon, Text } from '@chakra-ui/react'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Link from '../../Link/Link'
import { ListItem } from '../../List/List'
import WalletAddress from '../../Wallet/Address'
import AccountImage from '../../Wallet/Image'

export type Props = {
  address: string
  image: string | null | undefined
  name: string | null | undefined
  verified: boolean
  quantity: string
}

const OwnersModalItem: FC<Props> = ({
  address,
  image,
  name,
  quantity,
  verified,
}) => {
  const { t } = useTranslation('components')
  return (
    <Flex as={Link} href={`/users/${address}`}>
      <ListItem
        image={
          <Flex
            as={AccountImage}
            address={address}
            image={image}
            size={40}
            rounded="full"
          />
        }
        label={
          <Flex display="inline-flex" align="center" columnGap={1.5}>
            <Text
              as="span"
              color="brand.black"
              fontWeight="medium"
              title={name || address}
            >
              {name || <WalletAddress address={address} isShort />}
            </Text>
            {verified && (
              <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
            )}
          </Flex>
        }
        caption={t('token.modal-item.owns', {
          count: parseInt(quantity, 10),
        })}
      />
    </Flex>
  )
}

export default OwnersModalItem
