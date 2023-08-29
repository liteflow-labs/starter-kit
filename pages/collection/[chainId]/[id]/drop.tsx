import { SimpleGrid } from '@chakra-ui/react'
import DropHeader from 'components/Drop/DropHeader'
import DropMintForm from 'components/Drop/MintForm'
import environment from 'environment'
import type { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useMemo } from 'react'
import DropDetailSkeleton from '../../../../components/Drop/DropDetailSkeleton'
import DropHeaderSkeleton from '../../../../components/Drop/DropHeaderSkeleton'
import DropMintSchedule from '../../../../components/Drop/DropMintSchedule'
import DropProgress from '../../../../components/Drop/DropProgress'
import Head from '../../../../components/Head'
import {
  convertCollectionDropDetail,
  convertDropDetail,
} from '../../../../convert'
import {
  useFetchCollectionDropDetailQuery,
  useFetchCollectionDropsQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../../layouts/large'

const DropDetail: NextPage = () => {
  const { t } = useTranslation('templates')
  const chainId = useRequiredQueryParamSingle<number>('chainId', {
    parse: parseInt,
  })
  const collectionAddress = useRequiredQueryParamSingle('id')
  const { address } = useAccount()

  const { data: collectionData, loading: collectionLoading } =
    useFetchCollectionDropDetailQuery({
      variables: {
        address: collectionAddress,
        chainId,
      },
    })

  const { data: dropsData } = useFetchCollectionDropsQuery({
    variables: {
      address: collectionAddress,
      minter: address || '',
      chainId,
    },
  })

  const collectionDropDetail = useMemo(
    () =>
      collectionData?.collection
        ? convertCollectionDropDetail(collectionData.collection)
        : null,
    [collectionData],
  )

  const drops = useMemo(() => {
    if (!dropsData?.drops) return []
    return dropsData.drops.nodes.map((drop) => convertDropDetail(drop))
  }, [dropsData?.drops])

  if (!collectionLoading && !collectionDropDetail)
    return <Error statusCode={404} />
  return (
    <LargeLayout>
      <Head title={collectionDropDetail?.name || t('drops.title')} />
      {!collectionDropDetail ? (
        <DropHeaderSkeleton />
      ) : (
        <DropHeader
          collection={collectionDropDetail}
          reportEmail={environment.REPORT_EMAIL}
        />
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
