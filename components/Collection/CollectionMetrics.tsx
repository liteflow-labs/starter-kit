import { Divider, Flex, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, useMemo } from 'react'
import useEnvironment from '../../hooks/useEnvironment'

type Props = {
  chainId: number
  metrics: {
    numberOfOwners: number
    supply: number
    floorPrice: {
      valueInRef: string
      refCode: string
    } | null
    totalVolume: {
      valueInRef: string
      refCode: string
    }
  }
}

const CollectionMetrics: FC<Props> = ({ chainId, metrics }) => {
  const { CHAINS } = useEnvironment()
  const { t } = useTranslation('templates')

  const blocks = useMemo(() => {
    const chain = CHAINS.find((x) => x.id === chainId)
    return [
      {
        name: t('collection.header.data-labels.total-volume'),
        value:
          numbro(metrics.totalVolume.valueInRef).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 4,
          }) +
          ' ' +
          metrics.totalVolume.refCode,
        title: `${metrics.totalVolume.valueInRef} ${metrics.totalVolume.refCode}`,
      },
      {
        name: t('collection.header.data-labels.floor-price'),
        value: metrics.floorPrice
          ? numbro(metrics.floorPrice.valueInRef).format({
              thousandSeparated: true,
              trimMantissa: true,
              mantissa: 4,
            }) +
            ' ' +
            metrics.floorPrice.refCode
          : '-',
        title: metrics.floorPrice
          ? `${metrics.floorPrice.valueInRef} ${metrics.floorPrice.refCode}`
          : '-',
      },
      {
        name: t('collection.header.data-labels.owners'),
        value: numbro(metrics.numberOfOwners).format({
          thousandSeparated: true,
        }),
        title: metrics.numberOfOwners.toString(),
      },
      {
        name: t('collection.header.data-labels.items'),
        value: numbro(metrics.supply).format({ thousandSeparated: true }),
        title: metrics.supply.toString(),
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
  }, [CHAINS, chainId, metrics, t])

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
