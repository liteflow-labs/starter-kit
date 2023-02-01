import { Flex, SimpleGrid, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

type TraitListProps = {
  traits: {
    type: string
    value: string
    totalCount: number
    percent: number
  }[]
}

const TraitList: FC<TraitListProps> = ({ traits }) => {
  const { t } = useTranslation('components')
  return (
    <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
      {traits.map((trait, i) => (
        <Flex
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
            {trait.type === 'Category'
              ? t(`categories.${trait.type}`, null, { fallback: trait.type })
              : trait.type}
          </Text>
          <Text
            as="span"
            variant="subtitle2"
            color="brand.black"
            title={trait.value}
            isTruncated
          >
            {trait.type === 'Category'
              ? t(`categories.${trait.value}`, null, { fallback: trait.value })
              : trait.value}
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
