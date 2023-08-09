import { Heading } from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import Head from '../components/Head'
import { useFetchDropsQuery } from '../graphql'
import usePaginateQuery from '../hooks/usePaginateQuery'
import LargeLayout from '../layouts/large'

type Props = {
  now: string
}

const DropsPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { page, limit, offset } = usePaginateQuery()

  const { data, loading } = useFetchDropsQuery({
    variables: { now: date, limit, offset },
  })

  console.log(page)
  console.log(data)
  console.log(loading)

  return (
    <LargeLayout>
      <Head title={t('drops.title')} />
      <Heading as="h1" variant="title" color="brand.black">
        {t('drops.title')}
      </Heading>
    </LargeLayout>
  )
}

export default DropsPage
