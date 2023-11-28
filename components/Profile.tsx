import { GridItem, SimpleGrid, Stack } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'
import type { TabsEnum } from '../components/User/Profile/Navigation'
import UserProfileNavigation from '../components/User/Profile/Navigation'
import { useFetchAccountDetailQuery } from '../graphql'
import useAccount from '../hooks/useAccount'
import { isSameAddress } from '../utils'
import Head from './Head'
import UserProfileBanner from './User/Profile/Banner'
import UserProfileInfo from './User/Profile/Info'

type Props = PropsWithChildren<{
  address: string
  currentTab: TabsEnum
  loginUrlForReferral?: string
}>

const UserProfileTemplate: FC<Props> = ({
  address,
  currentTab,
  loginUrlForReferral,
  children,
}) => {
  const { address: currentAccount } = useAccount()
  const { data: accountData } = useFetchAccountDetailQuery({
    variables: { address },
  })
  const account = accountData?.account

  return (
    <>
      <Head
        title={account?.name || address}
        description={account?.description || undefined}
        image={account?.image || undefined}
      />
      <UserProfileBanner address={address} user={account} />
      <SimpleGrid
        mb={6}
        spacingX={{ lg: 12 }}
        spacingY={{ base: 12, lg: 0 }}
        columns={{ base: 1, lg: 4 }}
      >
        <UserProfileInfo
          address={address}
          user={account}
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
