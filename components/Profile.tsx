import { GridItem, SimpleGrid, Stack } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { FC, PropsWithChildren, useMemo } from 'react'
import type { TabsEnum } from '../components/User/Profile/Navigation'
import UserProfileNavigation from '../components/User/Profile/Navigation'
import { convertFullUser } from '../convert'
import {
  useFetchAccountDetailQuery,
  useFetchAccountMetadataQuery,
} from '../graphql'
import { isSameAddress } from '../utils'
import Head from './Head'
import UserProfileBanner from './User/Profile/Banner'
import UserProfileInfo from './User/Profile/Info'

const UserProfileTemplate: FC<
  PropsWithChildren<{
    now: Date
    signer: Signer | undefined
    currentAccount: string | null | undefined
    address: string
    currentTab: TabsEnum
    loginUrlForReferral?: string
  }>
> = ({
  now,
  signer,
  currentAccount,
  address,
  currentTab,
  loginUrlForReferral,
  children,
}) => {
  const { data, previousData } = useFetchAccountDetailQuery({
    variables: { address },
  })
  const { data: metadata, previousData: previousMetadata } =
    useFetchAccountMetadataQuery({ variables: { address, now } })

  const accountData = useMemo(() => data || previousData, [data, previousData])

  const account = useMemo(
    () => convertFullUser(accountData?.account || null, address),
    [accountData, address],
  )

  const metadataData = useMemo(
    () => metadata || previousMetadata,
    [metadata, previousMetadata],
  )

  const totals = useMemo(
    () =>
      new Map<TabsEnum, number | undefined>([
        ['created', metadataData?.created?.totalCount],
        ['on-sale', metadataData?.onSale?.totalCount],
        ['owned', metadataData?.owned?.totalCount],
      ]),
    [metadataData],
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
