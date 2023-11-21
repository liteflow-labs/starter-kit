import { Divider, Heading, SimpleGrid } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import DropCard from '../components/Drop/DropCard'
import Empty from '../components/Empty/Empty'
import Head from '../components/Head'
import Pagination from '../components/Pagination/Pagination'
import SkeletonDropCard from '../components/Skeleton/DropCard'
import SkeletonGrid from '../components/Skeleton/Grid'
import { useFetchDropsQuery } from '../graphql'
import useEnvironment from '../hooks/useEnvironment'
import usePaginate from '../hooks/usePaginate'
import usePaginateQuery from '../hooks/usePaginateQuery'
import LargeLayout from '../layouts/large'

type Props = {
  now: string
}

const DropsPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const { PAGINATION_LIMIT, REPORT_EMAIL } = useEnvironment()
  const date = useMemo(() => new Date(now), [now])
  const { page, limit, offset } = usePaginateQuery()
  const { changeLimit } = usePaginate()

  const { data, loading, refetch } = useFetchDropsQuery({
    variables: { now: date, limit, offset },
  })

  const activeDrops = useMemo(() => {
    const inprogressDrops = data?.inProgress?.nodes || []
    const upcomingDrops = data?.upcoming?.nodes || []
    return [...inprogressDrops, ...upcomingDrops]
  }, [data?.inProgress?.nodes, data?.upcoming?.nodes])

  const endedDrops = useMemo(
    () => data?.ended?.nodes || [],
    [data?.ended?.nodes],
  )

  const isEmpty = useMemo(
    () => endedDrops.length === 0 && activeDrops.length === 0,
    [endedDrops.length, activeDrops.length],
  )

  const onCountdownEnd = useCallback(async () => await refetch(), [refetch])

  const calculateTotalSupply = useCallback(
    (drops: { supply: string | null }[]) =>
      drops.some((x) => !x.supply)
        ? null
        : drops.reduce(
            (acc, drop) => acc.add(BigNumber.from(drop.supply)),
            BigNumber.from(0),
          ),
    [],
  )

  return (
    <LargeLayout>
      <Head title={t('drops.title')} />
      <Heading as="h1" variant="title" color="brand.black" mb={4}>
        {t('drops.title')}
      </Heading>
      {loading ? (
        <SkeletonGrid items={4} columns={{ base: 1, md: 2 }} spacing={3}>
          <SkeletonDropCard />
        </SkeletonGrid>
      ) : isEmpty ? (
        <Empty
          title={t('drops.empty.title')}
          description={t('drops.empty.description')}
          button={t('drops.empty.action')}
          href={`mailto:${REPORT_EMAIL}`}
          isExternal
        />
      ) : (
        <>
          {activeDrops.length > 0 && (
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={3}
              w="full"
              mb={endedDrops.length > 0 ? 8 : 0}
            >
              {activeDrops.map((drop, i) => {
                invariant(
                  drop.drops.nodes[0],
                  'drops must have at least one drop',
                )
                return (
                  <DropCard
                    key={i}
                    collection={{ ...drop }}
                    drop={drop.drops.nodes[0]}
                    totalSupply={calculateTotalSupply(drop.drops.nodes)}
                    onCountdownEnd={onCountdownEnd}
                  />
                )
              })}
            </SimpleGrid>
          )}

          {endedDrops.length > 0 && (
            <>
              <Heading as="h2" variant="subtitle" color="brand.black" mb={4}>
                {t('drops.past-drops')}
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                {endedDrops.map((drop, i) => {
                  invariant(
                    drop.lastDrop.nodes[0],
                    'drops must have at least one drop',
                  )
                  return (
                    <DropCard
                      key={i}
                      collection={{ ...drop }}
                      drop={drop.lastDrop.nodes[0]}
                      totalSupply={calculateTotalSupply(drop.allDrops.nodes)}
                    />
                  )
                })}
              </SimpleGrid>
            </>
          )}

          <Divider
            my="6"
            display={endedDrops.length !== 0 ? 'block' : 'none'}
          />
          {endedDrops.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onLimitChange={changeLimit}
              hasNextPage={data?.ended?.pageInfo.hasNextPage}
              hasPreviousPage={data?.ended?.pageInfo.hasPreviousPage}
            />
          )}
        </>
      )}
    </LargeLayout>
  )
}

export default DropsPage
