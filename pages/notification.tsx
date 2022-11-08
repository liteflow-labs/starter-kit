import { Notification } from '@nft/templates'
import { connectors } from 'connectors'
import useEagerConnect from 'hooks/useEagerConnect'
import { NextPage } from 'next'
import Head from '../components/Head'
import environment from '../environment'
import SmallLayout from '../layouts/small'

export const getServerSideProps = Notification.server(environment.GRAPHQL_URL)

const NotificationPage: NextPage<Notification.Props> = ({ address }) => {
  const reconnected = useEagerConnect(connectors, address)
  return (
    <SmallLayout>
      <Head title="Notifications" />
      <Notification.Template
        userHasBeenReconnected={reconnected}
        address={address}
      />
    </SmallLayout>
  )
}

export default NotificationPage
