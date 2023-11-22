import CollectionCard from 'components/Collection/CollectionCard'
import { useOrderByKey } from 'hooks/useOrderByKey'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import invariant from 'ts-invariant'
import {
  CollectionFilter,
  FetchCollectionsQuery,
  useFetchCollectionsQuery,
} from '../../graphql'
import useEnvironment from '../../hooks/useEnvironment'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const CollectionsHomeSection: FC<Props> = () => {
  const { HOME_COLLECTIONS, PAGINATION_LIMIT } = useEnvironment()
  const { t } = useTranslation('templates')
  const collectionsQuery = useFetchCollectionsQuery({
    variables: {
      filter: {
        or: HOME_COLLECTIONS.map((x) => x.split('-')).map(
          ([chainId, collectionAddress]) => {
            invariant(chainId && collectionAddress, 'invalid collection')
            return {
              address: { equalTo: collectionAddress.toLowerCase() },
              chainId: { equalTo: parseInt(chainId, 10) },
            }
          },
        ),
      } as CollectionFilter,
      limit: PAGINATION_LIMIT,
    },
    skip: !HOME_COLLECTIONS.length,
  })
  useHandleQueryError(collectionsQuery)

  const orderedCollections = useOrderByKey(
    HOME_COLLECTIONS,
    collectionsQuery.data?.collections?.nodes,
    (collection) => [collection.chainId, collection.address].join('-'),
  )

  if (!HOME_COLLECTIONS.length) return null
  return (
    <HomeGridSection
      explore={{
        href: '/explore/collections',
        title: t('home.collections.explore'),
      }}
      items={orderedCollections}
      itemRender={(
        collection: NonNullable<
          FetchCollectionsQuery['collections']
        >['nodes'][number],
      ) => <CollectionCard collection={collection} />}
      title={t('home.collections.title')}
    />
  )
}

export default CollectionsHomeSection
