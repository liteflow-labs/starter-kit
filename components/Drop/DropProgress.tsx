import { Flex, Progress, SimpleGrid, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, useMemo } from 'react'

type Props = {
  drops: {
    minted: string
    supply: string | null
  }[]
}

const DropProgress: FC<Props> = ({ drops }) => {
  const { t } = useTranslation('components')

  const totalMinted = useMemo(
    () =>
      drops.reduce(
        (acc, drop) => acc.add(BigNumber.from(drop.minted)),
        BigNumber.from(0),
      ),
    [drops],
  )

  const totalSupply = useMemo(() => {
    if (drops.some((x) => !x.supply)) return null
    return drops
      .filter((x) => !!x.supply)
      .reduce(
        (acc, drop) => acc.add(BigNumber.from(drop.supply)),
        BigNumber.from(0),
      )
  }, [drops])

  const mintPercentage = useMemo(() => {
    if (!totalSupply) return
    return (totalMinted.toNumber() / totalSupply.toNumber()) * 100
  }, [totalMinted, totalSupply])

  return (
    <Flex flexDirection="column" py={8} gap={2} width="full">
      <SimpleGrid columns={2} spacing={3}>
        <Text variant="subtitle1">
          {mintPercentage
            ? t('drop.progress.percentage', {
                percentage: numbro(mintPercentage).format({
                  trimMantissa: true,
                  mantissa: 2,
                }),
              })
            : t('drop.progress.minted')}
        </Text>
        <Text variant="subtitle1" textAlign="end">{`${numbro(
          totalMinted,
        ).format({
          thousandSeparated: true,
        })} / ${
          !totalSupply
            ? '∞'
            : numbro(totalSupply).format({
                thousandSeparated: true,
              })
        }`}</Text>
      </SimpleGrid>
      <Progress
        colorScheme="brand"
        rounded="full"
        size="xs"
        value={mintPercentage}
      />
    </Flex>
  )
}

export default DropProgress
