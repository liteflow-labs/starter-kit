import { Flex, SimpleGrid, Text } from '@chakra-ui/react'
import Link from 'components/Link/Link'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback } from 'react'

type TraitListProps = {
  chainId: number
  collectionAddress: string
  traits: {
    type: string
    value: string
    percent: number
  }[]
}

const TraitList: FC<TraitListProps> = ({
  chainId,
  collectionAddress,
  traits,
}) => {
  const { t } = useTranslation('components')
  const href = useCallback(
    (type: string, value: string) =>
      `/collection/${chainId}/${collectionAddress}?traits[${type}]=${value}`,
    [chainId, collectionAddress],
  )
  return (
    <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
      {traits.map((trait, i) => (
        <Flex
          as={Link}
          href={href(trait.type, trait.value)}
          key={i}
          flexDirection="column"
          rounded="xl"
          border="1px"
          borderColor="gray.200"
          p={3}
        >
          <Text
            as="span"
            variant="caption"
            color="gray.500"
            title={trait.type}
            isTruncated
            pb={1}
          >
            {trait.type}
          </Text>
          <Text
            as="span"
            variant="subtitle2"
            color="brand.black"
            title={trait.value}
            isTruncated
          >
            {trait.value}
          </Text>
          <Text
            as="span"
            variant="caption"
            color="brand.black"
            title={t('traits.percent', { value: trait.percent.toFixed(2) })}
            isTruncated
          >
            {t('traits.percent', { value: trait.percent.toFixed(2) })}
          </Text>
        </Flex>
      ))}
    </SimpleGrid>
  )
}

export default TraitList
