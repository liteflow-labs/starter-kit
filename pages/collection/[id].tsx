import CollectionHeader from 'components/Collection/CollectionHeader'
import Head from 'components/Head'
import { convertCollection } from 'convert'
import environment from 'environment'
import LargeLayout from 'layouts/large'
import { wrapServerSideProps } from 'props'
import { FC } from 'react'
import invariant from 'ts-invariant'
import {
  FetchCollectionDetailsDocument,
  FetchCollectionDetailsQuery,
  FetchCollectionDetailsQueryVariables,
} from '../../graphql'

type Props = {
  collectionDetails: {
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

    const { data: collectionDetailsData, error: collectionDetailsError } =
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

    if (collectionDetailsError) throw collectionDetailsError
    if (!collectionDetailsData)
      throw new Error('collectionDetailsData is falsy')
    if (!collectionDetailsData.collection) return { notFound: true }

    return {
      props: {
        collectionDetails: convertCollection(collectionDetailsData.collection),
      },
    }
  },
)

const CollectionPage: FC<Props> = ({ collectionDetails }) => {
  return (
    <LargeLayout>
      <Head title="Explore collection" />

      <CollectionHeader
        collection={collectionDetails}
        baseURL={environment.BASE_URL}
        reportEmail={environment.REPORT_EMAIL}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
      />
    </LargeLayout>
  )
}

export default CollectionPage
