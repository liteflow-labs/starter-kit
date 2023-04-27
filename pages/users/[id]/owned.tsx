import { Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Head from '../../../components/Head'
import Loader from '../../../components/Loader'
import UserProfileTemplate from '../../../components/Profile'
import TokenGrid from '../../../components/Token/Grid'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertFullUser,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import {
  AssetDetailFragment,
  OwnershipsOrderBy,
  useFetchOwnedAssetsQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import LargeLayout from '../../../layouts/large'

type Props = {
  now: string
}

const OwnedPage: NextPage<Props> = ({ now }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { pathname, replace, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OwnershipsOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const { address } = useAccount()
  const userAddress = useRequiredQueryParamSingle('id')

  const date = useMemo(() => new Date(now), [now])
  const { data, loading } = useFetchOwnedAssetsQuery({
    variables: {
      address: userAddress,
      currentAddress: address || '',
      limit,
      offset,
      orderBy,
      now: date,
    },
  })

  const userAccount = useMemo(
    () => convertFullUser(data?.account || null, userAddress),
    [data, userAddress],
  )

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  const assets = useMemo(
    () =>
      (data?.owned?.nodes || [])
        .map((x) => x.asset)
        .filter((x): x is AssetDetailFragment => !!x)
        .map((x) => ({
          ...convertAsset(x),
          auction: x.auctions?.nodes[0]
            ? convertAuctionWithBestBid(x.auctions.nodes[0])
            : undefined,
          creator: convertUser(x.creator, x.creator.address),
          sale: convertSale(x.firstSale?.nodes[0]),
          numberOfSales: x.firstSale.totalCount,
          hasMultiCurrency:
            parseInt(
              x.currencySales.aggregates?.distinctCount?.currencyId,
              10,
            ) > 1,
        })),
    [data],
  )

  if (loading) return <Loader fullPage />
  if (!data) return <></>
  return (
    <LargeLayout>
      <Head
        title={data.account?.name || userAddress}
        description={data.account?.description || ''}
        image={data.account?.image || ''}
      />
      <UserProfileTemplate
        signer={signer}
        currentAccount={address}
        account={userAccount}
        currentTab="owned"
        totals={
          new Map([
            ['created', data.created?.totalCount || 0],
            ['on-sale', data.onSale?.totalCount || 0],
            ['owned', data.owned?.totalCount || 0],
          ])
        }
        loginUrlForReferral={environment.BASE_URL + '/login'}
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
            limits: [environment.PAGINATION_LIMIT, 24, 36, 48],
            page,
            total: data.owned?.totalCount || 0,
            onPageChange: changePage,
            onLimitChange: changeLimit,
            result: {
              label: t('pagination.result.label'),
              caption: (props) => (
                <Trans
                  ns="templates"
                  i18nKey="pagination.result.caption"
                  values={props}
                  components={[
                    <Text as="span" color="brand.black" key="text" />,
                  ]}
                />
              ),
              pages: (props) =>
                t('pagination.result.pages', { count: props.total }),
            },
          }}
        />
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default OwnedPage
