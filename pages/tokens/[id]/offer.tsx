import { Box, Flex, Grid, GridItem, Heading, useToast } from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import Head from '../../../components/Head'
import BackButton from '../../../components/Navbar/BackButton'
import SalesDirectForm from '../../../components/Sales/Direct/Form'
import SkeletonForm from '../../../components/Skeleton/Form'
import SkeletonTokenCard from '../../../components/Skeleton/TokenCard'
import TokenCard from '../../../components/Token/Card'
import { useOfferForAssetQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useLoginRedirect from '../../../hooks/useLoginRedirect'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import SmallLayout from '../../../layouts/small'
import Error from '../../_error'

type Props = {
  assetId: string
  now: string
  currentAccount: string | null
  meta: {
    title: string
    description: string
    image: string
  }
}

const OfferPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const { address } = useAccount()
  useLoginRedirect()
  const assetId = useRequiredQueryParamSingle('id')
  const [chainId, collectionAddress, tokenId] = useMemo(
    () => assetId.split('-'),
    [assetId],
  )
  invariant(chainId && collectionAddress && tokenId, 'Invalid asset id')

  const date = useMemo(() => new Date(now), [now])
  const { data } = useOfferForAssetQuery({
    variables: {
      chainId: parseInt(chainId, 10),
      collectionAddress: collectionAddress,
      tokenId: tokenId,
      now: date,
      address: address || '',
    },
  })
  const asset = data?.asset

  const currencies = data?.currencies?.nodes

  const onCreated = useCallback(async () => {
    toast({
      title: t('offers.form.notifications.created'),
      status: 'success',
    })
    await push(`/tokens/${assetId}`)
  }, [toast, t, push, assetId])

  if (asset === null || asset?.deletedAt) return <Error statusCode={404} />
  return (
    <SmallLayout>
      <Head
        title={asset && t('offers.form.meta.title', asset)}
        description={asset && t('offers.form.meta.description', asset)}
        image={asset?.image}
      >
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" my={12}>
        {t('offers.form.title')}
      </Heading>

      <Grid
        mt={12}
        mb={6}
        gap={12}
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      >
        <GridItem overflow="hidden">
          <Box pointerEvents="none">
            {!asset ? <SkeletonTokenCard /> : <TokenCard asset={asset} />}
          </Box>
        </GridItem>
        <GridItem>
          <Flex direction="column" gap={8} grow={1} shrink={1} basis="0%">
            {!currencies || !asset ? (
              <SkeletonForm items={2} />
            ) : (
              <SalesDirectForm
                asset={asset}
                currencies={currencies}
                onCreated={onCreated}
              />
            )}
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default OfferPage
