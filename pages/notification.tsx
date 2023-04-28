import { Button, Heading, Icon, Stack, Text, useToast } from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import { FaBell } from '@react-icons/all-files/fa/FaBell'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import Empty from '../components/Empty/Empty'
import Head from '../components/Head'
import Loader from '../components/Loader'
import NotificationDetail from '../components/Notification/Detail'
import { concatToQuery } from '../concat'
import { useGetNotificationsQuery } from '../graphql'
import useAccount from '../hooks/useAccount'
import useEagerConnect from '../hooks/useEagerConnect'
import useLoginRedirect from '../hooks/useLoginRedirect'
import SmallLayout from '../layouts/small'

const NotificationPage: NextPage = ({}) => {
  const ready = useEagerConnect()
  const { t } = useTranslation('templates')
  const toast = useToast()
  const { address } = useAccount()
  useLoginRedirect(ready)
  const [_, setCookies] = useCookies()
  const [loading, setLoading] = useState(false)

  const {
    data,
    fetchMore,
    loading: fetching,
  } = useGetNotificationsQuery({
    variables: {
      cursor: null,
      address: address || '',
    },
    skip: !address,
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

  if (fetching) return <Loader fullPage />

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
              <NotificationDetail
                key={notification.id}
                currentAccount={address || null}
                {...notification}
              />
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
