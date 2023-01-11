import { Flex } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { VFC } from 'react'
import Link from '../../Link/Link'

type Props = {
  href: string
  isOwner: boolean
  showButton?: boolean
}

const SaleAuctionCardFooter: VFC<Props> = ({
  href,
  isOwner,
  showButton = true,
}) => {
  const { t } = useTranslation('components')
  return (
    <Flex
      as={Link}
      color={showButton ? 'white' : 'gray.500'}
      bgColor={showButton ? 'brand.500' : 'gray.100'}
      py={2}
      px={4}
      fontSize="sm"
      fontWeight="semibold"
      href={href}
    >
      {showButton
        ? isOwner
          ? t('sales.auction.card-footer.view')
          : t('sales.auction.card-footer.place-bid')
        : t('sales.auction.card-footer.ongoing-auction')}
    </Flex>
  )
}

export default SaleAuctionCardFooter
