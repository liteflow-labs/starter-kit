import { Notification } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../components/Head'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import SmallLayout from '../layouts/small'

export const getServerSideProps = Notification.server(environment.GRAPHQL_URL)

const NotificationPage: NextPage<Notification.Props> = ({ currentAccount }) => {
  const ready = useEagerConnect()
  return (
    <SmallLayout>
      <Head title="Notifications" />
      <Notification.Template currentAccount={currentAccount} ready={ready} />
    </SmallLayout>
  )
}

export default NotificationPage
