import { Divider, Heading, SimpleGrid } from '@chakra-ui/react'
import { Timeline } from 'hooks/useDropTimeline'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import DropCard from '../components/Drop/DropCard'
import Empty from '../components/Empty/Empty'
import Head from '../components/Head'
import Pagination from '../components/Pagination/Pagination'
import SkeletonDropCard from '../components/Skeleton/DropCard'
import SkeletonGrid from '../components/Skeleton/Grid'
import { convertDropActive, convertDropEnded } from '../convert'
import environment from '../environment'
import { useFetchDropsQuery } from '../graphql'
import usePaginate from '../hooks/usePaginate'
import usePaginateQuery from '../hooks/usePaginateQuery'
import LargeLayout from '../layouts/large'
import { dateIsBefore, dateIsBetween } from '../utils'

type Props = {
  now: string
}

const DropsPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { page, limit, offset } = usePaginateQuery()
  const [changePage, changeLimit] = usePaginate()

  const { data, loading } = useFetchDropsQuery({
    variables: { now: date, limit, offset },
  })

  const inprogressDrops = useMemo(() => {
    return (
      data?.inProgressAndUpComing?.nodes
        .filter((drop) => {
          if (
            drop.firstDrop.nodes[0]?.startDate == null ||
            drop.lastDrop.nodes[0]?.endDate == null
          )
            return false
          return dateIsBetween(
            date,
            drop.firstDrop.nodes[0]?.startDate,
            drop.lastDrop.nodes[0]?.endDate,
          )
        })
        .map((drop) => convertDropActive(drop)) || []
    )
  }, [date, data?.inProgressAndUpComing?.nodes])

  const upcomingDrops = useMemo(
    () =>
      data?.inProgressAndUpComing?.nodes
        .filter((drop) => {
          if (drop.firstDrop.nodes[0]?.startDate == null) return false

          return dateIsBefore(date, drop.firstDrop.nodes[0]?.startDate)
        })
        .map((drop) => convertDropActive(drop)) || [],
    [date, data?.inProgressAndUpComing?.nodes],
  )

  const endedDrops = useMemo(
    () => data?.ended?.nodes.map((drop) => convertDropEnded(drop)) || [],
    [data?.ended?.nodes],
  )

  const isEmpty = useMemo(
    () =>
      endedDrops.length === 0 &&
      inprogressDrops.length === 0 &&
      upcomingDrops.length === 0,
    [endedDrops.length, inprogressDrops.length, upcomingDrops.length],
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
          href={`mailto:${environment.REPORT_EMAIL}`}
          isExternal
        />
      ) : (
        <>
          {(inprogressDrops.length > 0 || upcomingDrops.length > 0) && (
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={3}
              w="full"
              mb={endedDrops.length > 0 ? 8 : 0}
            >
              {inprogressDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  drop={drop}
                  timeline={Timeline.INPROGRESS}
                />
              ))}
              {upcomingDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  drop={drop}
                  timeline={Timeline.UPCOMING}
                />
              ))}
            </SimpleGrid>
          )}

          {endedDrops.length > 0 && (
            <>
              <Heading as="h2" variant="subtitle" color="brand.black" mb={4}>
                {t('drops.past-drops')}
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                {endedDrops.map((drop) => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    timeline={Timeline.ENDED}
                  />
                ))}
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
              limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onPageChange={changePage}
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
