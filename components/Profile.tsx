import { GridItem, SimpleGrid, Stack } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { isSameAddress } from '@nft/hooks'
import { FC } from 'react'
import type { TabsEnum } from '../components/User/Profile/Navigation'
import UserProfileNavigation from '../components/User/Profile/Navigation'
import UserProfileBanner from './User/Profile/Banner'
import UserProfileInfo from './User/Profile/Info'

const UserProfileTemplate: FC<{
  signer: Signer | undefined
  currentAccount: string | null | undefined
  account: {
    address: string
    image: string | null
    name: string | null
    description: string | null
    cover: string | null
    instagram: string | null
    twitter: string | null
    website: string | null
    verified: boolean
  }
  currentTab: TabsEnum
  totals: Map<TabsEnum, number>
  loginUrlForReferral?: string
}> = ({
  signer,
  currentAccount,
  account,
  currentTab,
  totals,
  loginUrlForReferral,
  children,
}) => {
  if (!account) throw new Error('account is falsy')
  return (
    <>
      <UserProfileBanner
        address={account.address}
        cover={account.cover}
        image={account.image}
        name={account.name}
      />
      <SimpleGrid
        mb={6}
        spacingX={{ lg: 12 }}
        spacingY={{ base: 12, lg: 0 }}
        columns={{ base: 1, lg: 4 }}
      >
        <UserProfileInfo
          signer={signer}
          address={account.address}
          description={account.description}
          instagram={account.instagram}
          name={account.name}
          twitter={account.twitter}
          website={account.website}
          verified={account.verified}
          loginUrlForReferral={loginUrlForReferral}
        />
        <GridItem colSpan={{ lg: 3 }}>
          <Stack spacing={6}>
            <UserProfileNavigation
              baseUrl={`/users/${account.address}`}
              showPrivateTabs={
                !!currentAccount &&
                isSameAddress(currentAccount, account.address)
              }
              currentTab={currentTab}
              totals={totals}
            />
            {children}
          </Stack>
        </GridItem>
      </SimpleGrid>
    </>
  )
}

export default UserProfileTemplate
