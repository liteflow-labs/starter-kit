import CollectionCard from 'components/Collection/CollectionCard'
import { convertCollection } from 'convert'
import environment from 'environment'
import { useOrderByAddress } from 'hooks/useOrderByAddress'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { useFetchCollectionsQuery } from '../../graphql'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const CollectionsHomeSection: FC<Props> = () => {
  const { t } = useTranslation('templates')
  const collectionsQuery = useFetchCollectionsQuery({
    variables: {
      collectionIds: environment.HOME_COLLECTIONS || '',
      limit: environment.PAGINATION_LIMIT,
    },
    skip: !environment.HOME_COLLECTIONS,
  })
  useHandleQueryError(collectionsQuery)

  const collections = useMemo(
    () => collectionsQuery.data?.collections?.nodes || [],
    [collectionsQuery.data?.collections?.nodes],
  )

  const orderedCollections = useOrderByAddress(
    environment.HOME_COLLECTIONS,
    collections,
  )

  return (
    <HomeGridSection
      explore={{
        href: '/explore/collections',
        title: t('home.collections.explore'),
      }}
      isLoading={collectionsQuery.loading}
      items={orderedCollections}
      itemRender={(collection: typeof collections[0]) => (
        <CollectionCard collection={convertCollection(collection)} />
      )}
      title={t('home.collections.title')}
    />
  )
}

export default CollectionsHomeSection
