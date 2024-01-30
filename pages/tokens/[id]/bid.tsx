import { Box, Flex, Grid, GridItem, Heading, useToast } from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import Head from '../../../components/Head'
import BackButton from '../../../components/Navbar/BackButton'
import OfferFormBid from '../../../components/Offer/Form/Bid'
import SkeletonForm from '../../../components/Skeleton/Form'
import SkeletonTokenCard from '../../../components/Skeleton/TokenCard'
import TokenCard from '../../../components/Token/Card'
import { useBidOnAssetQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import SmallLayout from '../../../layouts/small'
import Error from '../../_error'

type Props = {
  now: string
}

const BidPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const { address } = useAccount()
  const assetId = useRequiredQueryParamSingle('id')
  const [chainId, collectionAddress, tokenId] = useMemo(
    () => assetId.split('-'),
    [assetId],
  )
  invariant(chainId && collectionAddress && tokenId, 'Invalid asset id')

  const date = useMemo(() => new Date(now), [now])
  const { data } = useBidOnAssetQuery({
    variables: {
      chainId: parseInt(chainId, 10),
      collectionAddress: collectionAddress,
      tokenId: tokenId,
      now: date,
      address: address || '',
    },
  })
  const asset = data?.asset

  const onCreated = useCallback(async () => {
    toast({
      title: t('offers.bid.notifications.created'),
      status: 'success',
    })
    await push(`/tokens/${assetId}`)
  }, [toast, t, push, assetId])

  if (asset === null || asset?.deletedAt) return <Error statusCode={404} />
  return (
    <SmallLayout>
      <Head
        title={asset && t('offers.bid.meta.title', asset)}
        description={
          asset &&
          t('offers.bid.meta.description', {
            name: asset.name,
            creator: asset.creator.name || asset.creator.address,
          })
        }
        image={asset?.image}
      >
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" my={12}>
        {t('offers.bid.title')}
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
          <Flex direction="column" flex="1 1 0%">
            {!asset || !data?.currencies?.nodes ? (
              <SkeletonForm items={2} />
            ) : (
              <OfferFormBid
                asset={asset}
                currencies={data.currencies.nodes}
                onCreated={onCreated}
              />
            )}
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default BidPage
