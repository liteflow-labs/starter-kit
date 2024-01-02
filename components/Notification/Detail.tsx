import { Box, Flex, Text } from '@chakra-ui/react'
import { JSX, useMemo } from 'react'
import invariant from 'ts-invariant'
import { AccountVerificationStatus, NotificationAction } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import { dateFromNow } from '../../utils'
import Image from '../Image/Image'
import Link from '../Link/Link'
import AccountImage from '../Wallet/Image'
import {
  AccountVerificationValidated,
  BidAccepted,
  BidCreated,
  BidExpired,
  OfferExpired,
  OfferPurchased,
  ReferralRefereeRegistered,
} from './types/index'

export type IProps = {
  createdAt: Date
  action: NotificationAction
  accountVerification: {
    status: AccountVerificationStatus
    account: {
      address: string
      image: string | null
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
  accountVerification,
  offer,
  trade,
  refereeAccount,
  ...props
}: IProps): JSX.Element {
  const { address: currentAccount } = useAccount()
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
                fill
                sizes="56px"
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
