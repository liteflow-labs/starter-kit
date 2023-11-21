import { NetworkStatus } from '@apollo/client'
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Heading,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { concatToQuery } from '../../../concat'
import {
  CollectionFilter,
  StringFilter,
  useSearchCollectionQuery,
} from '../../../graphql'
import { Filter } from '../../../hooks/useAssetFilterFromQuery'
import { formatError } from '../../../utils'
import CollectionListItem from '../../Collection/ListItem'
import List, { ListItem } from '../../List/List'
import SearchInput from '../../SearchInput'

type Props = {
  formValues: UseFormReturn<Filter, any, undefined>
  onFilterChange: (data?: Partial<Filter>) => void
}

const PAGINATION_LIMIT = 8

const FilterByCollection: FC<Props> = ({
  formValues: { setValue, watch },
  onFilterChange,
}) => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const [offset, setOffset] = useState(0)

  const filterResult = watch()

  const {
    data: collectionData,
    fetchMore,
    networkStatus,
  } = useSearchCollectionQuery({
    variables: {
      offset: 0, // the offset change must be done when calling the fetchMore function to concat queries' results
      limit: PAGINATION_LIMIT,
      filter: {
        name: {
          includesInsensitive: filterResult.collectionSearch || '',
        } as StringFilter,
        ...(filterResult.chains.length
          ? { chainId: { in: filterResult.chains } }
          : {}),
      } as CollectionFilter,
    },
    notifyOnNetworkStatusChange: true,
  })
  const collections = collectionData?.collections?.nodes
  const hasNextPage = collectionData?.collections?.pageInfo.hasNextPage

  const loadMore = useCallback(async () => {
    const newOffset = offset + PAGINATION_LIMIT
    try {
      await fetchMore({
        variables: { offset: newOffset },
        updateQuery: concatToQuery('collections'),
      })
      setOffset(newOffset)
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    }
  }, [fetchMore, offset, toast])

  const collection = useMemo(() => {
    if (!filterResult.collection) return
    const [chainId, address] = filterResult.collection.split('-')
    if (!chainId || !address) return
    const collection = collections?.find(
      (x) => x.address === address && x.chainId === parseInt(chainId, 10),
    )
    return collection
  }, [collections, filterResult.collection])

  return collection ? (
    <AccordionItem>
      <AccordionButton>
        <Heading variant="heading2" flex="1" textAlign="left">
          {t('filters.assets.properties.labelWithCollection')}
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Stack spacing={3}>
          <CollectionListItem
            width="full"
            borderColor="brand.500"
            bgColor="brand.50"
            borderWidth="1px"
            borderRadius="md"
            padding={2}
            textAlign="left"
            cursor="pointer"
            onClick={() => onFilterChange({ collection: null, traits: [] })}
            collection={collection}
            closable
          />
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  ) : (
    <AccordionItem>
      <AccordionButton>
        <Heading variant="heading2" flex="1" textAlign="left">
          {t('filters.assets.collections.label')}
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Stack spacing={4}>
          <SearchInput
            placeholder={t('filters.assets.collections.search.placeholder')}
            name="collectionSearch"
            onReset={() => setValue('collectionSearch', '')}
          />
          <List>
            {!collections ? (
              new Array(PAGINATION_LIMIT)
                .fill(0)
                .map((_, index) => (
                  <ListItem
                    key={index}
                    image={<SkeletonCircle size="8" borderRadius="sm" />}
                    imageSize={8}
                    imageRounded="sm"
                    label={<SkeletonText noOfLines={2} width="24" />}
                    action={<SkeletonText noOfLines={2} width="24" />}
                  />
                ))
            ) : collections.length > 0 ? (
              <>
                {collections.map((collection) => (
                  <CollectionListItem
                    key={`${collection.chainId}-${collection.address}`}
                    cursor={'pointer'}
                    rounded="xl"
                    transition={'background-color 0.3s ease-in-out'}
                    _hover={{
                      bgColor: 'brand.50',
                    }}
                    onClick={() =>
                      onFilterChange({
                        collection: `${collection.chainId}-${collection.address}`,
                        traits: [],
                      })
                    }
                    collection={collection}
                  />
                ))}
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
                      {t('filters.collections.more')}
                    </Text>
                  </Button>
                )}
              </>
            ) : (
              <VStack spacing={1}>
                <Text variant="subtitle2" color="gray.800" as="span">
                  {t('filters.collections.empty.title')}
                </Text>
                <Text variant="caption" as="span">
                  {t('filters.collections.empty.description')}
                </Text>
              </VStack>
            )}
          </List>
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  )
}

export default FilterByCollection
