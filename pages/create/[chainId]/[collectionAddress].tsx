import {
  Alert,
  AlertIcon,
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Skeleton,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { useConfig } from '@nft/hooks'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import Head from '../../../components/Head'
import Link from '../../../components/Link/Link'
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
  const { data: config } = useConfig()
  const toast = useToast()
  const { data, loading, previousData } = useFetchAccountAndCollectionQuery({
    variables: {
      chainId,
      collectionAddress,
      account: address || '',
    },
  })

  const collection = useMemo(
    () => data?.collection || previousData?.collection,
    [data, previousData],
  )

  const account = useMemo(
    () => data?.account || previousData?.account,
    [data, previousData],
  )

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

  if (
    account &&
    environment.RESTRICT_TO_VERIFIED_ACCOUNT &&
    !creator.verified
  ) {
    return (
      <Layout>
        <BackButton onClick={back} />
        <Heading as="h1" variant="title" color="brand.black" mt={6} mb={12}>
          {t('asset.typeSelector.title')}
        </Heading>
        <Stack align="center" spacing={6} mb={40}>
          <Center bgColor="brand.50" w={12} h={12} rounded="full">
            <Icon as={HiBadgeCheck} color="brand.500" w={6} h={6} />
          </Center>
          <Stack textAlign="center">
            <Heading variant="heading1">{t('asset.restricted.title')}</Heading>
            <Text pb={2} color="gray.500">
              <Trans
                ns="templates"
                i18nKey="asset.restricted.description"
                components={[
                  <Link
                    fontWeight="bold"
                    href={`mailto:${environment.REPORT_EMAIL}`}
                    key="report"
                  >
                    {environment.REPORT_EMAIL}
                  </Link>,
                ]}
              />
            </Text>
          </Stack>
          <Alert
            status="info"
            rounded="xl"
            borderWidth="1px"
            borderColor="blue.300"
          >
            <AlertIcon />
            <Text variant="subtitle2">{t('asset.restricted.info')}</Text>
          </Alert>
        </Stack>
      </Layout>
    )
  }

  if (!loading && !collection) return <Error statusCode={404} />
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
              uploadUrl={environment.UPLOAD_URL}
              blockExplorer={blockExplorer}
              onCreated={onCreated}
              onInputChange={setFormData}
              activateUnlockableContent={config?.hasUnlockableContent || false}
              maxRoyalties={environment.MAX_ROYALTIES}
              activateLazyMint={config?.hasLazyMint || false}
            />
          )}
        </GridItem>
      </Grid>
    </Layout>
  )
}

export default CreatePage
