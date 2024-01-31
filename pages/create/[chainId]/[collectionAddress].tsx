import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Skeleton,
  Text,
  useToast,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import Head from '../../../components/Head'
import BackButton from '../../../components/Navbar/BackButton'
import SkeletonForm from '../../../components/Skeleton/Form'
import SkeletonTokenCard from '../../../components/Skeleton/TokenCard'
import TokenCard from '../../../components/Token/Card'
import type { FormData } from '../../../components/Token/Form/Create'
import TokenFormCreate from '../../../components/Token/Form/Create'
import { useFetchAccountAndCollectionQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useLocalFileURL from '../../../hooks/useLocalFileURL'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import SmallLayout from '../../../layouts/small'
import Error from '../../_error'

const CreatePage: NextPage = () => {
  const collectionAddress = useRequiredQueryParamSingle('collectionAddress')
  const chainId = useRequiredQueryParamSingle<number>('chainId', {
    parse: parseInt,
  })
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const { address } = useAccount()
  const toast = useToast()
  const { data } = useFetchAccountAndCollectionQuery({
    variables: {
      chainId,
      collectionAddress,
      account: address || '',
    },
  })
  const collection = data?.collection
  const account = data?.account

  const [formData, setFormData] = useState<Partial<FormData>>()

  const imageLocal = useLocalFileURL(
    formData?.isAnimation ? formData?.preview : formData?.content,
  )
  const animationLocal = useLocalFileURL(
    formData?.isAnimation ? formData.content : undefined,
  )

  const asset = useMemo(() => {
    if (!collection) return
    return {
      id: '--',
      image: imageLocal?.url || '',
      imageMimetype: imageLocal?.mimetype || null,
      animationUrl: animationLocal?.url || null,
      animationMimetype: animationLocal?.mimetype || null,
      name: formData?.name || '',
      bestBid: undefined,
      collection: {
        address: collection.address,
        chainId: collection.chainId,
        name: collection.name,
        standard: collection.standard,
      },
      owned: null,
      quantity: '1',
    }
  }, [imageLocal, animationLocal, formData?.name, collection])

  const creator = useMemo(
    () => ({
      address: account?.address || '0x',
      image: account?.image || null,
      name: account?.name || null,
      verification: account?.verification
        ? {
            status: account?.verification?.status,
          }
        : null,
    }),
    [account],
  )

  const onCreated = useCallback(
    async (assetId: string) => {
      toast({
        title: t('asset.form.notifications.created'),
        status: 'success',
      })
      await push(`/tokens/${assetId}`)
    },
    [push, t, toast],
  )

  if (collection === null || collection?.deletedAt)
    return <Error statusCode={404} />
  return (
    <SmallLayout>
      <Head
        title="Create Collectible"
        description="Create Collectible securely stored on blockchain"
      />
      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" mt={6}>
        {!collection ? (
          <Skeleton height="1em" width="50%" />
        ) : collection.standard === 'ERC1155' ? (
          t('asset.form.title.multiple')
        ) : (
          t('asset.form.title.single')
        )}
      </Heading>

      <Grid
        mt={12}
        mb={6}
        gap={12}
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      >
        <GridItem overflow="hidden">
          <Flex as={Text} color="brand.black" mb={3} variant="button1">
            {t('asset.form.preview')}
          </Flex>
          <Box pointerEvents="none">
            {!asset ? (
              <SkeletonTokenCard />
            ) : (
              <TokenCard
                asset={{
                  ...asset,
                  creator,
                  bestBid: { nodes: [] },
                  firstSale: undefined,
                }}
              />
            )}
          </Box>
        </GridItem>
        <GridItem overflow="hidden">
          {!collection ? (
            <SkeletonForm items={4} />
          ) : (
            <TokenFormCreate
              collection={collection}
              onCreated={onCreated}
              onInputChange={setFormData}
            />
          )}
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default CreatePage
