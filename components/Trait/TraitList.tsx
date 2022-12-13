import { Flex, SimpleGrid, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import React, { FC } from 'react'

type TraitListProps = {
  traits: { type: string; value: string; rarity?: string }[]
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
            {t(`categories.${trait.type}`, null, { fallback: trait.type })}
          </Text>
          <Text
            as="span"
            variant="subtitle2"
            color="brand.black"
            title={trait.value}
            isTruncated
          >
            {t(`categories.${trait.value}`, null, { fallback: trait.value })}
          </Text>
          {trait.rarity && (
            <Text
              as="span"
              variant="caption"
              color="brand.black"
              title={t('traits.rarity', { value: trait.rarity })}
              isTruncated
            >
              {t('traits.rarity', { value: trait.rarity })}
            </Text>
          )}
        </Flex>
      ))}
    </SimpleGrid>
  )
}

export default TraitList
