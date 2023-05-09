import CollectionCard from 'components/Collection/CollectionCard'
import { convertCollection } from 'convert'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { useFetchCollectionsQuery } from '../../graphql'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const CollectionsHomeSection: FC<Props> = () => {
  const { t } = useTranslation('templates')
  const collectionsQuery = useFetchCollectionsQuery({
    // TODO: change limit
    variables: { limit: 6 },
  })
  useHandleQueryError(collectionsQuery)

  const collections = useMemo(
    () => collectionsQuery.data?.collections?.nodes || [],
    [collectionsQuery.data?.collections?.nodes],
  )
  return (
    <HomeGridSection
      explore={{ href: '/explore', title: t('home.explore') }}
      isLoading={collectionsQuery.loading}
      items={collections}
      itemRender={(collection: typeof collections[0]) => (
        <CollectionCard collection={convertCollection(collection)} />
      )}
      title={t('home.featured')}
    />
  )
}

export default CollectionsHomeSection
