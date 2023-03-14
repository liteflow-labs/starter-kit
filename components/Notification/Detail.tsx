import { Box, Flex, Text } from '@chakra-ui/react'
import { dateFromNow } from '@nft/hooks'
import { useMemo } from 'react'
import invariant from 'ts-invariant'
import { AccountVerificationStatus, NotificationAction } from '../../graphql'
import Image from '../Image/Image'
import Link from '../Link/Link'
import AccountImage from '../Wallet/Image'
import {
  AccountVerificationValidated,
  AuctionBidCreated,
  AuctionBidExpired,
  AuctionEndedNoBids,
  AuctionEndedReservePriceBuyer,
  AuctionEndedReservePriceSeller,
  AuctionEndedWonBuyer,
  AuctionEndedWonSeller,
  AuctionExpired,
  AuctionExpireSoon,
  BidAccepted,
  BidCreated,
  BidExpired,
  OfferExpired,
  OfferPurchased,
  ReferralRefereeRegistered,
} from './types/index'

export type IProps = {
  createdAt: Date
  currentAccount: string | null
  action: NotificationAction
  accountVerification: {
    status: AccountVerificationStatus
    account: {
      address: string
      image: string | null
    }
  } | null
  auction: {
    asset: {
      id: string
      image: string
      name: string
    }
  } | null
  offer: {
    amount: string
    unitPrice: string
    quantity: string
    asset: {
      image: string
      name: string
    }
    currency: {
      decimals: number
      symbol: string
    }
  } | null
  trade: {
    quantity: string
    buyerAddress: string
    buyer: {
      username: string | null
    } | null
  } | null
  refereeAccount: {
    address: string
    username: string | null
    image: string | null
  } | null
}

export default function NotificationDetail({
  action,
  createdAt,
  currentAccount,
  accountVerification,
  auction,
  offer,
  trade,
  refereeAccount,
  ...props
}: IProps): JSX.Element {
  const content:
    | {
        link: string
        children: JSX.Element
        image: string
      }
    | {
        link: string
        children: JSX.Element
        userImage: string | null
        userAddress: string
      }
    | undefined = useMemo(() => {
    invariant(currentAccount, 'currentAccount is required')
    switch (action) {
      case 'ACCOUNT_VERIFICATION_VALIDATED':
        invariant(accountVerification, 'accountVerification is required')
        return AccountVerificationValidated({ accountVerification })

      case 'OFFER_PURCHASED':
        invariant(offer, 'offer is required')
        return OfferPurchased({ currentAccount, offer, trade })

      case 'BID_ACCEPTED':
        invariant(offer, 'offer is required')
        return BidAccepted({ currentAccount, offer })

      case 'BID_CREATED':
        invariant(offer, 'offer is required')
        return BidCreated({ currentAccount, offer })

      case 'AUCTION_BID_CREATED':
        invariant(auction, 'auction is required')
        invariant(offer, 'offer is required')
        return AuctionBidCreated({ auction, currentAccount, offer })

      case 'AUCTION_BID_EXPIRED':
        invariant(auction, 'auction is required')
        invariant(offer, 'offer is required')
        return AuctionBidExpired({ auction, currentAccount, offer })

      case 'AUCTION_ENDED_WON_SELLER':
        invariant(auction, 'auction is required')
        invariant(offer, 'offer is required')
        return AuctionEndedWonSeller({ auction, currentAccount, offer })

      case 'AUCTION_ENDED_RESERVEPRICE_SELLER':
        invariant(auction, 'auction is required')
        return AuctionEndedReservePriceSeller({ auction, currentAccount })

      case 'AUCTION_ENDED_NOBIDS':
        invariant(auction, 'auction is required')
        return AuctionEndedNoBids({ auction, currentAccount })

      case 'AUCTION_ENDED_WON_BUYER':
        invariant(auction, 'auction is required')
        return AuctionEndedWonBuyer({ auction })

      case 'AUCTION_ENDED_RESERVEPRICE_BUYER':
        invariant(auction, 'auction is required')
        return AuctionEndedReservePriceBuyer({ auction })

      case 'AUCTION_EXPIRE_SOON':
        invariant(auction, 'auction is required')
        invariant(offer, 'offer is required')
        return AuctionExpireSoon({ auction, currentAccount, offer })

      case 'AUCTION_EXPIRED':
        invariant(auction, 'auction is required')
        return AuctionExpired({ auction, currentAccount })

      case 'BID_EXPIRED':
        invariant(offer, 'offer is required')
        return BidExpired({ currentAccount, offer })

      case 'OFFER_EXPIRED':
        invariant(offer, 'sale is required')
        return OfferExpired({ currentAccount, offer })

      case 'REFERRAL_REFEREE_REGISTERED':
        invariant(refereeAccount, 'refereeAccount is required')
        return ReferralRefereeRegistered({ refereeAccount })
    }
  }, [
    currentAccount,
    action,
    accountVerification,
    offer,
    trade,
    auction,
    refereeAccount,
  ])

  if (!content) return <></>
  return (
    <Link href={content.link}>
      <Flex align="center" gap={4} {...props}>
        {'image' in content && (
          <div>
            <Box
              position="relative"
              h={14}
              w={14}
              overflow="hidden"
              bgColor="gray.100"
              rounded="sm"
            >
              <Image
                src={content.image}
                alt="Square Image"
                width={56}
                height={56}
                objectFit="cover"
              />
            </Box>
          </div>
        )}
        {/* Fallback to avatar if image is not set but userAddress is set. userImage is optional */}
        {'userAddress' in content && 'userImage' in content && (
          <Flex
            as={AccountImage}
            address={content.userAddress}
            image={content.userImage}
            size={56}
            rounded="full"
          />
        )}
        <Box>
          <Text variant="caption" color="brand.black">
            {content.children}
            <Text as="span" ml={1} color="gray.500">
              {dateFromNow(createdAt)}
            </Text>
          </Text>
        </Box>
      </Flex>
    </Link>
  )
}
