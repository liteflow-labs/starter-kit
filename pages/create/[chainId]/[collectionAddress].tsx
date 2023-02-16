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
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { isSameAddress, useConfig } from '@nft/hooks'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiExclamationCircle } from '@react-icons/all-files/hi/HiExclamationCircle'
import Empty from 'components/Empty/Empty'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import Head from '../../../components/Head'
import Link from '../../../components/Link/Link'
import BackButton from '../../../components/Navbar/BackButton'
import type { Props as NFTCardProps } from '../../../components/Token/Card'
import TokenCard from '../../../components/Token/Card'
import type { FormData } from '../../../components/Token/Form/Create'
import TokenFormCreate from '../../../components/Token/Form/Create'
import environment from '../../../environment'
import {
  FetchAccountAndCollectionDocument,
  FetchAccountAndCollectionQuery,
  FetchAccountAndCollectionQueryVariables,
  useFetchAccountAndCollectionQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useLocalFileURL from '../../../hooks/useLocalFileURL'
import useSigner from '../../../hooks/useSigner'
import SmallLayout from '../../../layouts/small'
import { wrapServerSideProps } from '../../../props'
import { values as traits } from '../../../traits'

type Props = {
  chainId: number
  collectionAddress: string
  currentAccount: string | null
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (context, client) => {
    const chainId = Array.isArray(context.query.chainId)
      ? context.query.chainId[0]
      : context.query.chainId
    const collectionAddress = Array.isArray(context.query.collectionAddress)
      ? context.query.collectionAddress[0]
      : context.query.collectionAddress
    invariant(collectionAddress, "collectionAddress can't be falsy")
    invariant(chainId, "chainId can't be falsy")
    invariant(
      environment.MINTABLE_COLLECTIONS.filter(({ address }) =>
        isSameAddress(address, collectionAddress),
      ).length > 0,
      'collectionAddress is not mintable',
    )
    const { data, error } = await client.query<
      FetchAccountAndCollectionQuery,
      FetchAccountAndCollectionQueryVariables
    >({
      query: FetchAccountAndCollectionDocument,
      variables: {
        chainId: parseInt(chainId, 10),
        account: context.user.address || '',
        collectionAddress,
      },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {
        chainId: parseInt(chainId, 10),
        collectionAddress,
        currentAccount: context.user.address,
      },
    }
  },
)

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SmallLayout>
    <Head
      title="Create Collectible"
      description="Create Collectible securely stored on blockchain"
    />
    {children}
  </SmallLayout>
)

const CreatePage: NextPage<Props> = ({
  currentAccount,
  chainId,
  collectionAddress,
}) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const { address } = useAccount()
  const { data: config } = useConfig()
  const toast = useToast()
  const { data } = useFetchAccountAndCollectionQuery({
    variables: {
      chainId,
      collectionAddress,
      account: (ready ? address : currentAccount) || '',
    },
  })

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
    if (!data?.collection) return
    return {
      id: '',
      image: imageUrlLocal || '',
      animationUrl: animationUrlLocal,
      name: formData?.name || '',
      bestBid: undefined,
      collection: {
        address: data.collection.address,
        chainId: data.collection.chainId,
        name: data.collection.name,
      },
      owned: BigNumber.from(0),
      unlockedContent: null,
    } as NFTCardProps['asset'] // TODO: use satisfies to ensure proper type
  }, [imageUrlLocal, animationUrlLocal, formData?.name, data?.collection])

  const creator = useMemo(
    () => ({
      address: data?.account?.address || '0x',
      image: data?.account?.image || undefined,
      name: data?.account?.name || undefined,
      verified: data?.account?.verification?.status === 'VALIDATED',
    }),
    [data?.account],
  )

  const categories = useMemo(
    () =>
      (traits['Category'] || []).map((x) => ({
        id: x,
        title: t(`categories.${x}`, null, { fallback: x }),
      })) || [],
    [t],
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

  if (environment.RESTRICT_TO_VERIFIED_ACCOUNT && !creator.verified) {
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

  if (!data?.collection)
    return (
      <Empty
        title={t('asset.form.notFound.title')}
        description={t('asset.form.notFound.description')}
        button={t('asset.form.notFound.link')}
        href="/create"
        icon={<Icon as={HiExclamationCircle} w={8} h={8} color="gray.400" />}
      />
    )
  return (
    <Layout>
      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" mt={6}>
        {data.collection.standard === 'ERC1155'
          ? t('asset.form.title.multiple')
          : t('asset.form.title.single')}
      </Heading>

      <Grid
        mt={12}
        mb={6}
        gap={12}
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      >
        <GridItem>
          <Flex as={Text} color="brand.black" mb={3} variant="button1">
            {t('asset.form.preview')}
          </Flex>
          <Box pointerEvents="none">
            {asset && (
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
        <GridItem>
          <TokenFormCreate
            signer={signer}
            collection={data.collection}
            categories={categories}
            uploadUrl={environment.UPLOAD_URL}
            blockExplorer={blockExplorer}
            onCreated={onCreated}
            onInputChange={setFormData}
            activateUnlockableContent={config?.hasUnlockableContent || false}
            maxRoyalties={environment.MAX_ROYALTIES}
            activateLazyMint={config?.hasLazyMint || false}
          />
        </GridItem>
      </Grid>
    </Layout>
  )
}

export default CreatePage
