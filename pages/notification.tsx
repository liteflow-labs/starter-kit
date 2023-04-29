import {
  Button,
  Flex,
  Heading,
  Icon,
  Skeleton,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import { FaBell } from '@react-icons/all-files/fa/FaBell'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import Empty from '../components/Empty/Empty'
import Head from '../components/Head'
import NotificationDetail from '../components/Notification/Detail'
import SkeletonList from '../components/Skeleton/List'
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

  const { data, fetchMore, loading } = useGetNotificationsQuery({
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
        {(notifications || []).map((notification) => (
          <NotificationDetail
            key={notification.id}
            currentAccount={address || null}
            {...notification}
          />
        ))}
        {loading && (
          <SkeletonList items={5} gap={6}>
            <Flex align="center" gap={4}>
              <Skeleton height="56px" width="56px" borderRadius="full" />
              <Flex flex={1} gap={1} direction="column">
                <Skeleton height="15px" width="250px" />
              </Flex>
            </Flex>
          </SkeletonList>
        )}
        {hasNextPage && (
          <Button isLoading={loading} onClick={loadMore}>
            <Text as="span" isTruncated>
              {t('notifications.loadMore')}
            </Text>
          </Button>
        )}
        {!loading && notifications.length === 0 && (
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
