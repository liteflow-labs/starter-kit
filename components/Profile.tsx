import { GridItem, SimpleGrid, Stack } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { FC, PropsWithChildren, useMemo } from 'react'
import type { TabsEnum } from '../components/User/Profile/Navigation'
import UserProfileNavigation from '../components/User/Profile/Navigation'
import { convertFullUser } from '../convert'
import { useFetchAccountDetailQuery } from '../graphql'
import { isSameAddress } from '../utils'
import Head from './Head'
import UserProfileBanner from './User/Profile/Banner'
import UserProfileInfo from './User/Profile/Info'

const UserProfileTemplate: FC<
  PropsWithChildren<{
    signer: Signer | undefined
    currentAccount: string | null | undefined
    address: string
    currentTab: TabsEnum
    loginUrlForReferral?: string
  }>
> = ({
  signer,
  currentAccount,
  address,
  currentTab,
  loginUrlForReferral,
  children,
}) => {
  const { data: accountData } = useFetchAccountDetailQuery({
    variables: { address },
  })

  const account = useMemo(
    () => convertFullUser(accountData?.account || null, address),
    [accountData, address],
  )

  return (
    <>
      <Head
        title={account?.name || address}
        description={account?.description || ''}
        image={account?.image || ''}
      />
      <UserProfileBanner
        address={address}
        cover={account?.cover}
        image={account?.image}
        name={account?.name}
      />
      <SimpleGrid
        mb={6}
        spacingX={{ lg: 12 }}
        spacingY={{ base: 12, lg: 0 }}
        columns={{ base: 1, lg: 4 }}
      >
        <UserProfileInfo
          signer={signer}
          address={address}
          description={account?.description}
          instagram={account?.instagram}
          name={account?.name}
          twitter={account?.twitter}
          website={account?.website}
          verified={account?.verified}
          loginUrlForReferral={loginUrlForReferral}
        />
        <GridItem colSpan={{ lg: 3 }}>
          <Stack spacing={6}>
            <UserProfileNavigation
              baseUrl={`/users/${address}`}
              showPrivateTabs={
                !!currentAccount && isSameAddress(currentAccount, address)
              }
              currentTab={currentTab}
            />
            {children}
          </Stack>
        </GridItem>
      </SimpleGrid>
    </>
  )
}

export default UserProfileTemplate
