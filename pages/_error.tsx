import { Icon } from '@chakra-ui/react'
import { MdError } from '@react-icons/all-files/md/MdError'
import Empty from 'components/Empty/Empty'
import environment from 'environment'
import { NextPage, NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import Head from '../components/Head'
import SmallLayout from '../layouts/small'

interface Props {
  statusCode?: number
}

const Error: NextPage<Props> = ({ statusCode }) => {
  const { t } = useTranslation('templates')
  const content = useMemo(() => {
    if (statusCode === 404) {
      return {
        title: t('error.404.title'),
        description: t('error.404.description'),
      }
    }
    return {
      title: t('error.500.title'),
      description: t('error.500.description'),
    }
  }, [statusCode, t])
  return (
    <SmallLayout>
      <Head title={`${statusCode ? `${statusCode} ` : ''}Error`} />
      <Empty
        icon={<Icon as={MdError} color="red.500" h={9} w={9} />}
        title={content.title}
        description={content.description}
        button={t('error.button')}
        href={`mailto:${environment.REPORT_EMAIL}`}
        isExternal
      />
    </SmallLayout>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
