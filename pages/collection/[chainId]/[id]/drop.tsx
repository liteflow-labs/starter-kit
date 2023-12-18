import { Flex, SimpleGrid, Skeleton, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import CollectionHeader from '../../../../components/Collection/CollectionHeader'
import CollectionHeaderSkeleton from '../../../../components/Collection/CollectionHeaderSkeleton'
import DropDetailSkeleton from '../../../../components/Drop/DropDetailSkeleton'
import DropMintSchedule from '../../../../components/Drop/DropMintSchedule'
import DropProgress from '../../../../components/Drop/DropProgress'
import DropMintForm from '../../../../components/Drop/MintForm'
import Head from '../../../../components/Head'
import {
  useFetchCollectionDropDetailQuery,
  useFetchCollectionDropsQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useEnvironment from '../../../../hooks/useEnvironment'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../../layouts/large'
import Error from '../../../_error'

const DropDetail: NextPage = () => {
  const { t } = useTranslation('templates')
  const { CHAINS } = useEnvironment()
  const chainId = useRequiredQueryParamSingle<number>('chainId', {
    parse: parseInt,
  })
  const chain = CHAINS.find((x) => x.id === chainId)
  const collectionAddress = useRequiredQueryParamSingle('id')
  const { address } = useAccount()

  const { data: collectionData, loading: collectionLoading } =
    useFetchCollectionDropDetailQuery({
      variables: {
        address: collectionAddress,
        chainId,
      },
    })
  const collection = collectionData?.collection

  const { data: dropsData } = useFetchCollectionDropsQuery({
    variables: {
      address: collectionAddress,
      minter: address || '',
      chainId,
    },
  })
  const drops = dropsData?.drops?.nodes

  if (!collectionLoading && !collection) return <Error statusCode={404} />
  return (
    <LargeLayout>
      <Head
        title={collection?.name || t('drops.title')}
        description={collection?.description || ''}
        image={collection?.image || undefined}
      />
      {!collection ? (
        <>
          <CollectionHeaderSkeleton />
          <Flex flexDirection="column" justifyContent="center" mt={4} py={2}>
            <Skeleton height="1em" width="100px" mb={2} />
            <Skeleton height="1em" width="50px" />
          </Flex>
        </>
      ) : (
        <>
          <CollectionHeader collection={collection} />
          <Flex flexDirection="column" mt={4} py={2}>
            <Text variant="button1" color="brand.black">
              {chain?.name || '-'}
            </Text>
            <Text variant="subtitle2" color="gray.500">
              {t('collection.header.data-labels.chain')}
            </Text>
          </Flex>
        </>
      )}
      {!drops ? (
        <DropDetailSkeleton />
      ) : (
        <>
          <DropProgress drops={drops} />
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
            <DropMintForm
              order={{ base: 1, md: 2 }}
              collection={{ address: collectionAddress, chainId }}
              drops={drops}
            />
            <DropMintSchedule order={{ base: 2, md: 1 }} drops={drops} />
          </SimpleGrid>
        </>
      )}
    </LargeLayout>
  )
}

export default DropDetail
