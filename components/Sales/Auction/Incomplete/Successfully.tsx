import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { formatDate } from '../../../../utils'
import Link from '../../../Link/Link'
import Price from '../../../Price/Price'
import WalletAddress from '../../../Wallet/Address'
import AccountImage from '../../../Wallet/Image'

type Props = {
  isOwner: boolean
  auction: {
    expireAt: Date
  }
  bestAuctionBid: {
    maker: {
      address: string
      image: string | null
      name: string | null
    }
    unitPrice: string
    currency: {
      decimals: number
      symbol: string
    }
  }
}

const SaleAuctionIncompleteSuccess: FC<Props> = ({
  isOwner,
  auction,
  bestAuctionBid,
}) => {
  const { t } = useTranslation('components')
  return (
    <Stack spacing={8} mb={isOwner ? -5 : 0}>
      <hr />
      <Heading as="h2" variant="subtitle" color="brand.black">
        {t('sales.auction.success.ended')}
      </Heading>
      <Stack spacing={3}>
        <Heading as="h5" variant="heading3" color="gray.500">
          {t('sales.auction.success.highest-bid')}
        </Heading>
        <Flex align="center" gap={3}>
          <Flex
            as={AccountImage}
            address={bestAuctionBid.maker.address}
            image={bestAuctionBid.maker.image}
            rounded="full"
          />
          <Heading as="h4" variant="heading2" color="brand.black">
            <Trans
              ns="components"
              i18nKey="sales.auction.success.offer"
              components={[
                <Price
                  amount={bestAuctionBid.unitPrice}
                  currency={bestAuctionBid.currency}
                  key="price"
                />,
                <Text as="span" color="gray.500" key="text" />,
                <Link
                  href={`/users/${bestAuctionBid.maker.address}`}
                  key="link"
                >
                  {bestAuctionBid.maker.name ? (
                    <span>{bestAuctionBid.maker.name}</span>
                  ) : (
                    <WalletAddress
                      address={bestAuctionBid.maker.address}
                      isShort
                    />
                  )}
                </Link>,
              ]}
            />
          </Heading>
        </Flex>
      </Stack>

      {isOwner ? (
        <Alert status="warning" borderRadius="xl">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertTitle>
              {t('sales.auction.success.banner-owner.title', {
                date: formatDate(auction.expireAt),
              })}
            </AlertTitle>
            <AlertDescription>
              {t('sales.auction.success.banner-owner.description')}
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <Alert status="info" borderRadius="xl">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertTitle>
              {t('sales.auction.success.banner.title', {
                date: formatDate(auction.expireAt),
              })}
            </AlertTitle>
            <AlertDescription>
              {t('sales.auction.success.banner.description')}
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Stack>
  )
}

export default SaleAuctionIncompleteSuccess
