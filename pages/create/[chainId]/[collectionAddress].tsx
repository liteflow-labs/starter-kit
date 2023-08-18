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
import { BigNumber } from '@ethersproject/bignumber'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import Head from '../../../components/Head'
import BackButton from '../../../components/Navbar/BackButton'
import SkeletonForm from '../../../components/Skeleton/Form'
import SkeletonTokenCard from '../../../components/Skeleton/TokenCard'
import type { Props as NFTCardProps } from '../../../components/Token/Card'
import TokenCard from '../../../components/Token/Card'
import type { FormData } from '../../../components/Token/Form/Create'
import TokenFormCreate from '../../../components/Token/Form/Create'
import environment from '../../../environment'
import { useFetchAccountAndCollectionQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useLocalFileURL from '../../../hooks/useLocalFileURL'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import SmallLayout from '../../../layouts/small'
import { values as traits } from '../../../traits'

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SmallLayout>
    <Head
      title="Create Collectible"
      description="Create Collectible securely stored on blockchain"
    />
    {children}
  </SmallLayout>
)

const CreatePage: NextPage = ({}) => {
  const signer = useSigner()
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

  const blockExplorer = useBlockExplorer(chainId)
  const imageUrlLocal = useLocalFileURL(
    formData?.isPrivate || formData?.isAnimation
      ? formData?.preview
      : formData?.content,
  )
  const animationUrlLocal = useLocalFileURL(
    formData?.isAnimation && !formData.isPrivate ? formData.content : undefined,
  )

  const asset: NFTCardProps['asset'] | undefined = useMemo(() => {
    if (!collection) return
    return {
      id: '--',
      image: imageUrlLocal || '',
      animationUrl: animationUrlLocal,
      name: formData?.name || '',
      bestBid: undefined,
      collection: {
        address: collection.address,
        chainId: collection.chainId,
        name: collection.name,
      },
      owned: BigNumber.from(0),
      unlockedContent: null,
    } as NFTCardProps['asset'] // TODO: use satisfies to ensure proper type
  }, [imageUrlLocal, animationUrlLocal, formData?.name, collection])

  const creator = useMemo(
    () => ({
      address: account?.address || '0x',
      image: account?.image || undefined,
      name: account?.name || undefined,
      verified: account?.verification?.status === 'VALIDATED',
    }),
    [account],
  )

  const categories = useMemo(
    () => (traits['Category'] || []).map((x) => ({ id: x, title: x })) || [],
    [],
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

  if (collection === null) return <Error statusCode={404} />
  return (
    <Layout>
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
                asset={asset}
                creator={creator}
                auction={undefined}
                sale={undefined}
                numberOfSales={0}
                hasMultiCurrency={false}
              />
            )}
          </Box>
        </GridItem>
        <GridItem overflow="hidden">
          {!collection ? (
            <SkeletonForm items={4} />
          ) : (
            <TokenFormCreate
              signer={signer}
              collection={collection}
              categories={categories}
              blockExplorer={blockExplorer}
              onCreated={onCreated}
              onInputChange={setFormData}
              activateUnlockableContent={environment.UNLOCKABLE_CONTENT}
              maxRoyalties={environment.MAX_ROYALTIES}
              activateLazyMint={environment.LAZYMINT}
            />
          )}
        </GridItem>
      </Grid>
    </Layout>
  )
}

export default CreatePage
