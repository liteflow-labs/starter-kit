import { Icon } from '@chakra-ui/react'
import { MdError } from '@react-icons/all-files/md/MdError'
import Empty from 'components/Empty/Empty'
import environment from 'environment'
import { NextPage, NextPageContext } from 'next'
import Head from '../components/Head'
import SmallLayout from '../layouts/small'

interface Props {
  statusCode?: number
}

const Error: NextPage<Props> = ({ statusCode }) => {
  return (
    <SmallLayout>
      <Head title={`${statusCode ? `${statusCode.toString()} ` : ''}Error`} />
      <Empty
        icon={<Icon as={MdError} color="red.500" h={9} w={9} />}
        title="Error occurred"
        description={
          statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'
        }
        button="Contact"
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
