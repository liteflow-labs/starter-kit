import { Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import UserProfileTemplate from '../../../components/Profile'
import TokenGrid from '../../../components/Token/Grid'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import {
  AssetDetailFragment,
  AssetsOrderBy,
  useFetchOnSaleAssetsQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import LargeLayout from '../../../layouts/large'

type Props = {
  now: Date
}

const OnSalePage: NextPage<Props> = ({ now }) => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { pathname, replace, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const { address } = useAccount()
  const userAddress = useRequiredQueryParamSingle('id')

  const { data, loading, previousData } = useFetchOnSaleAssetsQuery({
    variables: {
      address: userAddress,
      currentAddress: address || '',
      limit,
      offset,
      orderBy,
      now,
    },
  })

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  const assetData = useMemo(() => data || previousData, [data, previousData])

  const assets = useMemo(
    () =>
      (assetData?.onSale?.nodes || [])
        .filter((x): x is AssetDetailFragment => !!x)
        .map((x) => ({
          ...convertAsset(x),
          auction: x.auctions?.nodes[0]
            ? convertAuctionWithBestBid(x.auctions.nodes[0])
            : undefined,
          creator: convertUser(x.creator, x.creator.address),
          sale: convertSale(x.firstSale?.nodes[0]),
          numberOfSales: x.firstSale.totalCount,
          hasMultiCurrency: x.firstSale.totalCurrencyDistinctCount > 1,
        })),
    [assetData],
  )

  return (
    <LargeLayout>
      <UserProfileTemplate
        now={now}
        signer={signer}
        currentAccount={address}
        address={userAddress}
        currentTab="on-sale"
        loginUrlForReferral={environment.BASE_URL + '/login'}
      >
        <TokenGrid<AssetsOrderBy>
          assets={assets}
          loading={loading && !assetData}
          orderBy={{
            value: orderBy,
            choices: [
              {
                label: t('user.on-sale-assets.orderBy.values.createdAtDesc'),
                value: 'CREATED_AT_DESC',
              },
              {
                label: t('user.on-sale-assets.orderBy.values.createdAtAsc'),
                value: 'CREATED_AT_ASC',
              },
            ],
            onSort: changeOrder,
          }}
          pagination={{
            limit,
            limits: [environment.PAGINATION_LIMIT, 24, 36, 48],
            page,
            total: assetData?.onSale?.totalCount || 0,
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

export default OnSalePage
