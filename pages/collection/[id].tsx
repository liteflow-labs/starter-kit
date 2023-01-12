import CollectionHeader from 'components/Collection/CollectionHeader'
import Head from 'components/Head'
import { convertCollection } from 'convert'
import environment from 'environment'
import {
  FetchCollectionDetailsDocument,
  FetchCollectionDetailsQuery,
  FetchCollectionDetailsQueryVariables,
} from 'graphql'
import LargeLayout from 'layouts/large'
import { wrapServerSideProps } from 'props'
import { FC } from 'react'
import invariant from 'ts-invariant'

type Props = {
  collection: {
    address: string
    chainId: number
    name: string
    description: string | null
    image: string
    cover: string | null
    twitter: string | null
    discord: string | null
    website: string | null
    deployerAddress: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    } | null
    totalVolume: string
    totalVolumeCurrencySymbol: string
    floorPrice: string
    floorPriceCurrencySymbol: string
    totalOwners: number
    supply: number
  }
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const collectionId = ctx.params?.id
      ? Array.isArray(ctx.params.id)
        ? ctx.params.id[0]
        : ctx.params.id
      : null
    invariant(collectionId, 'Collection ID is required')

    const { data: collectionDetailsData, error: collectionError } =
      await client.query<
        FetchCollectionDetailsQuery,
        FetchCollectionDetailsQueryVariables
      >({
        query: FetchCollectionDetailsDocument,
        variables: {
          address: collectionId,
          chainId: environment.CHAIN_ID,
        },
      })

    if (collectionError) throw collectionError
    if (!collectionDetailsData)
      throw new Error('collectionDetailsData is falsy')
    if (!collectionDetailsData.collection) return { notFound: true }

    return {
      props: {
        collection: convertCollection(collectionDetailsData.collection),
      },
    }
  },
)

const CollectionPage: FC<Props> = ({ collection }) => {
  return (
    <LargeLayout>
      <Head title="Explore collection" />

      <CollectionHeader collection={collection} />
    </LargeLayout>
  )
}

export default CollectionPage
