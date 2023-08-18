import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  Flex,
  Heading,
  SkeletonText,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useFetchCollectionTraitsQuery } from '../../../graphql'
import { Filter } from '../../../hooks/useAssetFilterFromQuery'

type Props = {
  collection:
    | {
        chainId: number
        address: string
      }
    | undefined
  filter: Filter
  formValues: UseFormReturn<Filter, any, undefined>
  propertySearch: string
  onFilterChange: (filter: Filter) => void
}

const FilterByTrait: FC<Props> = ({
  collection,
  filter,
  formValues: { watch },
  propertySearch,
  onFilterChange,
}) => {
  const { t } = useTranslation('components')

  const filterResult = watch()

  const { data } = useFetchCollectionTraitsQuery({
    variables: {
      address: (collection && collection.address) || '',
      chainId: (collection && collection.chainId) || 0,
    },
    skip: !collection,
    ssr: false,
  })

  const traitsData = data?.collection?.traitsOfCollection.nodes

  const traits = useMemo(() => {
    if (!traitsData) return
    if (!propertySearch) return traitsData
    return traitsData.filter(({ type }) =>
      type.toLowerCase().includes(propertySearch.toLowerCase()),
    )
  }, [propertySearch, traitsData])

  const addTrait = useCallback(
    (type: string, value: string) => {
      const existingValues =
        filterResult.traits.find((x) => x.type === type)?.values || []
      onFilterChange({
        ...filterResult,
        traits: [
          ...filterResult.traits.filter((x) => x.type !== type),
          {
            type,
            values: [
              ...(existingValues.filter((x) => x !== value) || []),
              value,
            ],
          },
        ],
      })
    },
    [onFilterChange, filterResult],
  )

  const removeTrait = useCallback(
    (type: string, value: string) => {
      const existingValues =
        filterResult.traits.find((x) => x.type === type)?.values || []
      const traits = filterResult.traits.filter((x) => x.type !== type)
      if (existingValues.includes(value) && existingValues.length === 1) {
        onFilterChange({ ...filterResult, traits })
      } else {
        onFilterChange({
          ...filterResult,
          traits: [
            ...traits,
            {
              type,
              values: existingValues.filter((x) => x !== value),
            },
          ],
        })
      }
    },
    [onFilterChange, filterResult],
  )

  if (!collection) return null
  return !traits ? (
    new Array(10).fill(0).map((_, index) => (
      <AccordionItem
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        key={index}
      >
        <SkeletonText noOfLines={1} width="80%" />
        <AccordionIcon />
      </AccordionItem>
    ))
  ) : traits.length > 0 ? (
    traits.map(({ type, values, numberOfValues }, i) => (
      <AccordionItem key={i}>
        <AccordionButton gap={4}>
          <Heading
            variant="heading2"
            flex="1"
            textAlign="left"
            noOfLines={1}
            wordBreak="break-word"
            title={type}
          >
            {type}
          </Heading>
          <Flex gap="4" alignItems="center">
            <Heading variant="heading2" color="gray.500">
              {numberOfValues}
            </Heading>
            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel maxHeight="400px" overflow="auto">
          <CheckboxGroup
            defaultValue={
              filter?.traits?.find((trait) => trait.type === type)?.values
            }
          >
            <Stack spacing={1}>
              {values.nodes.map(({ value, numberOfAssets }, i) => (
                <Checkbox
                  key={i}
                  value={value}
                  name={type}
                  onChange={(e) =>
                    e.target.checked
                      ? addTrait(type, value)
                      : removeTrait(type, value)
                  }
                >
                  <Flex justifyContent="space-between" gap={3}>
                    <Text
                      variant="subtitle2"
                      color="black"
                      noOfLines={1}
                      wordBreak="break-word"
                      title={value}
                    >
                      {value}
                    </Text>
                    <Text variant="subtitle2" color="black">
                      {numberOfAssets}
                    </Text>
                  </Flex>
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </AccordionPanel>
      </AccordionItem>
    ))
  ) : (
    <VStack spacing={1}>
      <Text variant="subtitle2" color="gray.800" as="span">
        {t('filters.traits.empty.title')}
      </Text>
      <Text variant="caption" as="span">
        {t('filters.traits.empty.description')}
      </Text>
    </VStack>
  )
}

export default FilterByTrait
