import { Button, Heading, Icon, Stack, Text, useToast } from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import { FaBell } from '@react-icons/all-files/fa/FaBell'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import Empty from '../components/Empty/Empty'
import Head from '../components/Head'
import NotificationDetail from '../components/Notification/Detail'
import { concatToQuery } from '../concat'
import environment from '../environment'
import {
  GetNotificationsDocument,
  GetNotificationsQuery,
  useGetNotificationsQuery,
} from '../graphql'
import useAccount from '../hooks/useAccount'
import useEagerConnect from '../hooks/useEagerConnect'
import useLoginRedirect from '../hooks/useLoginRedirect'
import SmallLayout from '../layouts/small'
import { wrapServerSideProps } from '../props'

type Props = {
  currentAccount: string | null
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const address = ctx.user.address
    if (!address) return { props: { currentAccount: null } }

    const { data, error } = await client.query<GetNotificationsQuery>({
      query: GetNotificationsDocument,
      variables: {
        cursor: null,
        address,
      },
    })
    if (error) throw error
    if (!data.notifications) return { notFound: true }
    return {
      props: {
        currentAccount: address,
      },
    }
  },
)

const NotificationPage: NextPage<Props> = ({ currentAccount }) => {
  const ready = useEagerConnect()
  const { t } = useTranslation('templates')
  const toast = useToast()
  const { address } = useAccount()
  useLoginRedirect(ready)
  const [_, setCookies] = useCookies()
  const [loading, setLoading] = useState(false)

  const { data, fetchMore } = useGetNotificationsQuery({
    variables: {
      cursor: null,
      address: currentAccount || '',
    },
    skip: !currentAccount,
  })

  const notifications = useMemo(() => data?.notifications?.nodes || [], [data])

  const hasNextPage = useMemo(
    () => data?.notifications?.pageInfo.hasNextPage,
    [data],
  )

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      await fetchMore({
        variables: { cursor: data?.notifications?.pageInfo.endCursor },
        updateQuery: concatToQuery('notifications'),
      })
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [data?.notifications?.pageInfo.endCursor, fetchMore, toast])

  useEffect(() => {
    if (!address) return
    setCookies(`lastNotification-${address}`, new Date().toJSON(), {
      secure: true,
      sameSite: true,
      path: '/',
    })
  }, [address, setCookies])

  return (
    <SmallLayout>
      <Head title="Notifications" />
      <Heading as="h1" variant="title" color="brand.black">
        {t('notifications.title')}
      </Heading>
      <Stack spacing={6} mt={12}>
        {(notifications || []).length > 0 ? (
          <>
            {notifications.map((notification) => (
              <NotificationDetail key={notification.id} {...notification} />
            ))}
            {hasNextPage && (
              <Button isLoading={loading} onClick={loadMore}>
                <Text as="span" isTruncated>
                  {t('notifications.loadMore')}
                </Text>
              </Button>
            )}
          </>
        ) : (
          <Empty
            icon={<Icon as={FaBell} color="brand.500" h={9} w={9} />}
            title={t('notifications.empty.title')}
            description={t('notifications.empty.description')}
          />
        )}
      </Stack>
    </SmallLayout>
  )
}

export default NotificationPage
