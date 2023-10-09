import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Link from '../../../Link/Link'
import Price from '../../../Price/Price'
import WalletAddress from '../../../Wallet/Address'
import AccountImage from '../../../Wallet/Image'

type Props = StackProps & {
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

const SaleAuctionIncompleteReservePrice: FC<Props> = ({
  bestAuctionBid,
  ...props
}) => {
  const { t } = useTranslation('components')
  return (
    <Stack spacing={8} {...props}>
      <hr />
      <Heading as="h2" variant="subtitle" color="brand.black">
        {t('sales.auction.failed-no-reserve.ended')}
      </Heading>
      <Stack spacing={3}>
        <Heading as="h5" variant="heading3" color="gray.500">
          {t('sales.auction.failed-no-reserve.highest-bid')}
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
              i18nKey="sales.auction.failed-no-reserve.offer"
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

      <Alert status="error" borderRadius="xl">
        <AlertIcon />
        <Box fontSize="sm">
          <AlertTitle>
            {t('sales.auction.failed-no-reserve.banner.title')}
          </AlertTitle>
          <AlertDescription>
            {t('sales.auction.failed-no-reserve.banner.description')}
          </AlertDescription>
        </Box>
      </Alert>
    </Stack>
  )
}

export default SaleAuctionIncompleteReservePrice
