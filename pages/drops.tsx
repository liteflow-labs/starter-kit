import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Timeline } from 'hooks/useDropTimeline'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
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

          <Box mt="6" py="6" borderTop="1px" borderColor="gray.200">
            <Pagination
              limit={limit}
              limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              total={data?.ended?.totalCount || 0}
              isLoading={loading}
              onPageChange={changePage}
              onLimitChange={changeLimit}
              result={{
                label: t('pagination.result.label'),
                caption: (props) => (
                  <Trans
                    ns="templates"
                    i18nKey="pagination.result.caption"
                    values={props}
                    components={[
                      <Text as="span" color="brand.black" key="text" />,
                    ]}
                  />
                ),
                pages: (props) =>
                  t('pagination.result.pages', { count: props.total }),
              }}
            />
          </Box>
        </>
      )}
    </LargeLayout>
  )
}

export default DropsPage
