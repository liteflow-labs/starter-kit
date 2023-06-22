import CollectionCard from 'components/Collection/CollectionCard'
import { convertCollection } from 'convert'
import environment from 'environment'
import { useOrderByKey } from 'hooks/useOrderByKey'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import invariant from 'ts-invariant'
import {
  CollectionFilter,
  FetchCollectionsQuery,
  useFetchCollectionsQuery,
} from '../../graphql'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const CollectionsHomeSection: FC<Props> = () => {
  const { t } = useTranslation('templates')
  const collectionsQuery = useFetchCollectionsQuery({
    variables: {
      filter: {
        or: environment.HOME_COLLECTIONS.map((x) => x.split('-')).map(
          ([chainId, collectionAddress]) => {
            invariant(chainId && collectionAddress, 'invalid collection')
            return {
              address: { equalTo: collectionAddress.toLowerCase() },
              chainId: { equalTo: parseInt(chainId, 10) },
            }
          },
        ),
      } as CollectionFilter,
      limit: environment.PAGINATION_LIMIT,
    },
    skip: !environment.HOME_COLLECTIONS,
  })
  useHandleQueryError(collectionsQuery)

  const collectionData = useMemo(
    () => collectionsQuery.data || collectionsQuery.previousData,
    [collectionsQuery.data, collectionsQuery.previousData],
  )

  const orderedCollections = useOrderByKey(
    environment.HOME_COLLECTIONS,
    collectionData?.collections?.nodes || [],
    (collection) => [collection.chainId, collection.address].join('-'),
  )

  return (
    <HomeGridSection
      explore={{
        href: '/explore/collections',
        title: t('home.collections.explore'),
      }}
      isLoading={collectionsQuery.loading && !collectionData}
      items={orderedCollections}
      itemRender={(
        collection: NonNullable<
          FetchCollectionsQuery['collections']
        >['nodes'][number],
      ) => <CollectionCard collection={convertCollection(collection)} />}
      title={t('home.collections.title')}
    />
  )
}

export default CollectionsHomeSection
