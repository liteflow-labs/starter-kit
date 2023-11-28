import UserCard from 'components/User/UserCard'
import { useOrderByKey } from 'hooks/useOrderByKey'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { FetchUsersQuery, useFetchUsersQuery } from '../../graphql'
import useEnvironment from '../../hooks/useEnvironment'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const UsersHomeSection: FC<Props> = () => {
  const { HOME_USERS, PAGINATION_LIMIT } = useEnvironment()
  const { t } = useTranslation('templates')
  const usersQuery = useFetchUsersQuery({
    variables: {
      userIds: HOME_USERS || '',
      limit: PAGINATION_LIMIT,
    },
    skip: !HOME_USERS.length,
  })
  useHandleQueryError(usersQuery)

  const orderedUsers = useOrderByKey(
    HOME_USERS,
    usersQuery.data?.users?.nodes,
    (user) => user.address,
  )

  if (!HOME_USERS.length) return null
  return (
    <HomeGridSection
      explore={{
        href: '/explore/users',
        title: t('home.users.explore'),
      }}
      items={orderedUsers}
      itemRender={(
        user: NonNullable<FetchUsersQuery['users']>['nodes'][number],
      ) => <UserCard user={user} />}
      title={t('home.users.title')}
    />
  )
}

export default UsersHomeSection
