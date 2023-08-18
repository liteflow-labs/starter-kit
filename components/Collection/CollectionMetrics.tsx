import { Divider, Flex, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, useMemo } from 'react'
import { chains } from '../../connectors'

type Props = {
  chainId: number
  metrics: {
    totalVolume: string
    totalVolumeCurrencySymbol: string
    floorPrice: string | null
    floorPriceCurrencySymbol: string | null
    totalOwners: number
    supply: number
  }
}

const CollectionMetrics: FC<Props> = ({ chainId, metrics }) => {
  const { t } = useTranslation('templates')

  const blocks = useMemo(() => {
    const chain = chains.find((x) => x.id === chainId)
    return [
      {
        name: t('collection.header.data-labels.total-volume'),
        value:
          numbro(metrics.totalVolume).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 4,
          }) +
          ' ' +
          metrics.totalVolumeCurrencySymbol,
        title: `${metrics.totalVolume} ${metrics.totalVolumeCurrencySymbol}`,
      },
      {
        name: t('collection.header.data-labels.floor-price'),
        value: metrics.floorPrice
          ? numbro(metrics.floorPrice).format({
              thousandSeparated: true,
              trimMantissa: true,
              mantissa: 4,
            }) +
            ' ' +
            metrics.floorPriceCurrencySymbol
          : '-',
        title: `${metrics.floorPrice || '-'} ${
          metrics.floorPriceCurrencySymbol
        }`,
      },
      {
        name: t('collection.header.data-labels.owners'),
        value: numbro(metrics.totalOwners).format({
          thousandSeparated: true,
        }),
        title: metrics.totalOwners?.toString(),
      },
      {
        name: t('collection.header.data-labels.items'),
        value: numbro(metrics.supply).format({ thousandSeparated: true }),
        title: metrics.supply?.toString(),
      },
      {
        type: 'separator',
      },
      {
        name: t('collection.header.data-labels.chain'),
        value: chain?.name || '-',
        title: chain?.name || '-',
      },
    ]
  }, [chainId, metrics, t])

  return (
    <Flex alignItems="center" rowGap={2} columnGap={8} mt={4} flexWrap="wrap">
      {blocks.map((block, i) =>
        block.type === 'separator' ? (
          <Divider orientation="vertical" height="40px" key={i} />
        ) : (
          <Flex key={i} flexDirection="column" justifyContent="center" py={2}>
            <Text
              variant="button1"
              title={block.title}
              color="brand.black"
              isTruncated
            >
              {block.value}
            </Text>
            <Text
              variant="subtitle2"
              title={block?.name}
              isTruncated
              color="gray.500"
            >
              {block.name}
            </Text>
          </Flex>
        ),
      )}
    </Flex>
  )
}

export default CollectionMetrics
