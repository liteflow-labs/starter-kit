import UserCard from 'components/User/UserCard'
import { convertUserWithCover } from 'convert'
import environment from 'environment'
import { useOrderByKey } from 'hooks/useOrderByKey'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { FetchUsersQuery, useFetchUsersQuery } from '../../graphql'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const UsersHomeSection: FC<Props> = () => {
  const { t } = useTranslation('templates')
  const usersQuery = useFetchUsersQuery({
    variables: {
      userIds: environment.HOME_USERS || '',
      limit: environment.PAGINATION_LIMIT,
    },
    skip: !environment.HOME_USERS.length,
  })
  useHandleQueryError(usersQuery)

  const orderedUsers = useOrderByKey(
    environment.HOME_USERS,
    usersQuery.data?.users?.nodes,
    (user) => user.address,
  )

  if (!environment.HOME_USERS.length) return null
  return (
    <HomeGridSection
      explore={{
        href: '/explore/users',
        title: t('home.users.explore'),
      }}
      items={orderedUsers}
      itemRender={(
        user: NonNullable<FetchUsersQuery['users']>['nodes'][number],
      ) => <UserCard user={convertUserWithCover(user, user.address)} />}
      title={t('home.users.title')}
    />
  )
}

export default UsersHomeSection
