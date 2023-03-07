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
import { BigNumber } from '@ethersproject/bignumber'
import { formatDate } from '@nft/hooks'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { VFC } from 'react'
import Link from '../../../Link/Link'
import Price from '../../../Price/Price'
import WalletAddress from '../../../Wallet/Address'
import AccountImage from '../../../Wallet/Image'

type Props = {
  isOwner: boolean
  auction: {
    expireAt: Date
  }
  bestBid: {
    maker: {
      address: string
      image: string | null | undefined
      name: string | null | undefined
    }
    unitPrice: BigNumber
    currency: {
      decimals: number
      symbol: string
    }
  }
}

const SaleAuctionIncompleteSuccess: VFC<Props> = ({
  isOwner,
  auction,
  bestBid,
}) => {
  const { t } = useTranslation('components')
  return (
    <Stack spacing={8}>
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
            address={bestBid.maker.address}
            image={bestBid.maker.image}
            rounded="full"
          />
          <Heading as="h4" variant="heading2" color="brand.black">
            <Trans
              ns="components"
              i18nKey="sales.auction.success.offer"
              components={[
                <Price
                  amount={bestBid.unitPrice}
                  currency={bestBid.currency}
                  key="price"
                />,
                <Text as="span" color="gray.500" key="text" />,
                <Link href={`/users/${bestBid.maker.address}`} key="link">
                  {bestBid.maker.name ? (
                    <span>{bestBid.maker.name}</span>
                  ) : (
                    <WalletAddress address={bestBid.maker.address} isShort />
                  )}
                </Link>,
              ]}
            />
          </Heading>
        </Flex>
      </Stack>

      {isOwner ? (
        <Alert
          status="warning"
          mb={isOwner ? '-20px !important' : 0}
          borderRadius="xl"
        >
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
