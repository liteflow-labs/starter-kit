import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import UserProfileTemplate from '../../../components/Profile'
import TokenGrid from '../../../components/Token/Grid'
import {
  AssetDetailFragment,
  OwnershipsOrderBy,
  useFetchOwnedAssetsQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useCart from '../../../hooks/useCart'
import useEnvironment from '../../../hooks/useEnvironment'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../layouts/large'

type Props = {
  now: string
}

const OwnedPage: NextPage<Props> = ({ now }) => {
  const { PAGINATION_LIMIT, BASE_URL } = useEnvironment()
  const { t } = useTranslation('templates')
  const { pathname, replace, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OwnershipsOrderBy>('CREATED_AT_DESC')
  const { changeLimit } = usePaginate()
  const { address } = useAccount()
  const userAddress = useRequiredQueryParamSingle('id')

  const date = useMemo(() => new Date(now), [now])
  const { data, refetch } = useFetchOwnedAssetsQuery({
    variables: {
      address: userAddress,
      currentAddress: address || '',
      limit,
      offset,
      orderBy,
      now: date,
    },
  })

  useCart({ onCheckout: refetch })

  const assets = useMemo(
    () =>
      data?.owned?.nodes
        .map((x) => x.asset)
        .filter((x): x is AssetDetailFragment => !!x),
    [data],
  )

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  return (
    <LargeLayout>
      <UserProfileTemplate
        address={userAddress}
        currentTab="owned"
        loginUrlForReferral={BASE_URL + '/login'}
      >
        <TokenGrid<OwnershipsOrderBy>
          assets={assets}
          orderBy={{
            value: orderBy,
            choices: [
              {
                label: t('user.owned-assets.orderBy.values.createdAtDesc'),
                value: 'CREATED_AT_DESC',
              },
              {
                label: t('user.owned-assets.orderBy.values.createdAtAsc'),
                value: 'CREATED_AT_ASC',
              },
            ],
            onSort: changeOrder,
          }}
          pagination={{
            limit,
            limits: [PAGINATION_LIMIT, 24, 36, 48],
            page,
            onLimitChange: changeLimit,
            hasNextPage: data?.owned?.pageInfo.hasNextPage,
            hasPreviousPage: data?.owned?.pageInfo.hasPreviousPage,
          }}
        />
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default OwnedPage
