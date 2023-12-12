import { NetworkStatus } from '@apollo/client'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Heading,
  SkeletonText,
  Stack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import SearchInput from 'components/SearchInput'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  CollectionTraitFilter,
  StringFilter,
  useFetchCollectionTraitsQuery,
} from '../../../graphql'
import { Filter } from '../../../hooks/useAssetFilterFromQuery'
import { formatError } from '../../../utils'

type Props = {
  collection: {
    chainId: number
    address: string
  }
  formValues: UseFormReturn<Filter, any, undefined>
  onFilterChange: (filter: Filter) => void
}

const PAGINATION_LIMIT = 8

const FilterByTrait: FC<Props> = ({
  collection,
  formValues: { setValue, watch },
  onFilterChange,
}) => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const [offset, setOffset] = useState(0)

  const filterResult = watch()

  const { data, fetchMore, networkStatus } = useFetchCollectionTraitsQuery({
    variables: {
      address: collection.address,
      chainId: collection.chainId,
      offset: 0, // the offset change must be done when calling the fetchMore function to concat queries' results
      limit: PAGINATION_LIMIT,
      filter: {
        type: {
          includesInsensitive: filterResult.propertySearch || '',
        } as StringFilter,
      } as CollectionTraitFilter,
    },
    notifyOnNetworkStatusChange: true,
  })

  const traitsData = data?.collection?.traitsOfCollection.nodes
  const hasNextPage = data?.collection?.traitsOfCollection.pageInfo.hasNextPage

  const loadMore = useCallback(async () => {
    const newOffset = offset + PAGINATION_LIMIT
    try {
      await fetchMore({
        variables: { offset: newOffset },
        // Cannot use concatToQuery function because of nested cache
        // Nested cache comes from the shape of FetchCollectionTraits query above
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (
            !fetchMoreResult ||
            !fetchMoreResult.collection?.traitsOfCollection
          )
            return prevResult
          return {
            ...fetchMoreResult,
            collection: {
              ...fetchMoreResult.collection,
              traitsOfCollection: {
                ...fetchMoreResult.collection.traitsOfCollection,
                nodes: [
                  ...(prevResult?.collection?.traitsOfCollection.nodes || []),
                  ...fetchMoreResult.collection.traitsOfCollection.nodes,
                ],
              },
            },
          }
        },
      })
      setOffset(newOffset)
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    }
  }, [fetchMore, offset, toast])

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

  return (
    <Accordion allowMultiple defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton>
          <Heading variant="heading2" flex="1" textAlign="left">
            {t('filters.assets.properties.label')}
          </Heading>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack spacing={4}>
            <SearchInput
              placeholder={t('filters.assets.properties.search.placeholder')}
              name="propertySearch"
              onReset={() => setValue('propertySearch', '')}
            />
            {!traitsData ? (
              new Array(PAGINATION_LIMIT).fill(0).map((_, index) => (
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
            ) : traitsData.length > 0 ? (
              <>
                <div>
                  {traitsData.map(({ type, values, numberOfValues }, i) => (
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
                            filterResult?.traits?.find(
                              (trait) => trait.type === type,
                            )?.values
                          }
                        >
                          <Stack spacing={1}>
                            {values.nodes.map(
                              ({ value, numberOfAssets }, i) => (
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
                              ),
                            )}
                          </Stack>
                        </CheckboxGroup>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </div>
                {hasNextPage && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={networkStatus === NetworkStatus.fetchMore}
                    onClick={loadMore}
                    width="fit-content"
                    mx="auto"
                  >
                    <Text as="span" isTruncated>
                      {t('filters.traits.more')}
                    </Text>
                  </Button>
                )}
              </>
            ) : (
              <VStack spacing={1}>
                <Text variant="subtitle2" color="gray.800" as="span">
                  {t('filters.traits.empty.title')}
                </Text>
                <Text variant="caption" as="span">
                  {t('filters.traits.empty.description')}
                </Text>
              </VStack>
            )}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default FilterByTrait
