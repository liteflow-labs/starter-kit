import { Box, Button, Flex, Icon, Text, Tooltip } from '@chakra-ui/react'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import Price from 'components/Price/Price'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo, useState } from 'react'
import { dateIsBefore } from 'utils'
import { Standard } from '../../graphql'
import useCart from '../../hooks/useCart'
import Image from '../Image/Image'
import Link from '../Link/Link'
import { ListItem } from '../List/List'

type Props = {
  cartItem: {
    id: string
    unitPrice: string
    availableQuantity: string
    expiredAt: Date
    currency: {
      image: string
      id: string
      decimals: number
      symbol: string
    }
    asset: {
      id: string
      image: string
      name: string
      collection: {
        chainId: number
        address: string
        name: string
        standard: Standard
      }
    }
  }
}

const CartDrawerListItem: FC<Props> = ({ cartItem }) => {
  const { t } = useTranslation('components')
  const [isHovered, setIsHovered] = useState(false)
  const { removeItem } = useCart()
  const isExpired = useMemo(
    () => !dateIsBefore(new Date(), cartItem.expiredAt),
    [cartItem.expiredAt],
  )
  return (
    <ListItem
      image={
        <Link href={`/tokens/${cartItem.asset.id}`}>
          <Image
            src={cartItem.asset.image}
            alt={cartItem.asset.name}
            width={40}
            height={40}
            w={10}
            h={10}
            objectFit="cover"
          />
        </Link>
      }
      label={
        <Text
          as={Link}
          href={`/tokens/${cartItem.asset.id}`}
          variant="subtitle2"
          color="gray.800"
          title={cartItem.asset.name}
        >
          {cartItem.asset.name}
        </Text>
      }
      subtitle={
        isExpired ? (
          <Flex
            as={Text}
            variant="caption"
            lineHeight={5}
            alignItems="center"
            gap={1}
          >
            <span>{t('cart.drawer.list-item.not-available')}</span>
            <Tooltip
              fontSize="xs"
              label={t('cart.drawer.list-item.tooltip')}
              placement="bottom"
              p={3}
            >
              <Box display="inline-flex" as="span">
                <Icon
                  as={FaInfoCircle}
                  color="gray.400"
                  h={4}
                  w={4}
                  cursor="pointer"
                />
              </Box>
            </Tooltip>
          </Flex>
        ) : (
          <Text
            as={Link}
            href={`/collection/${cartItem.asset.collection.chainId}/${cartItem.asset.collection.address}`}
            title={cartItem.asset.collection.name}
            variant="caption"
          >
            {cartItem.asset.collection.name}
          </Text>
        )
      }
      action={
        isHovered ? (
          <Button
            size="sm"
            colorScheme="gray"
            variant="outline"
            onClick={() => removeItem(cartItem.id)}
          >
            {t('cart.drawer.list-item.remove')}
          </Button>
        ) : isExpired ? undefined : (
          <Text variant="subtitle2" textAlign="end">
            <Price amount={cartItem.unitPrice} currency={cartItem.currency} />
          </Text>
        )
      }
      imageRounded="md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        bgColor: 'brand.50',
      }}
      rounded="xl"
    />
  )
}

export default CartDrawerListItem
