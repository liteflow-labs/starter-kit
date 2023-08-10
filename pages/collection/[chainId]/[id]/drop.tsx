import { Heading } from '@chakra-ui/react'
import DropHeader from 'components/Drop/DropHeader'
import DropMintForm from 'components/Drop/MintForm'
import environment from 'environment'
import type { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useMemo } from 'react'
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
      <Head title={t('drops.title')} />
      <Heading as="h1" variant="title" color="brand.black" mb={4}>
        {t('drops.title')}
      </Heading>
      <DropHeader
        collection={collectionDropDetail}
        reportEmail={environment.REPORT_EMAIL}
      />
      <DropProgress drops={drops} />
      <DropMintForm
        collection={{ address: collectionAddress, chainId }}
        drops={drops}
      />
      <DropMintSchedule drops={drops} />
    </LargeLayout>
  )
}

export default DropDetail
