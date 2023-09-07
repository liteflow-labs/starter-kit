import { Stack } from '@chakra-ui/react'
import AssetsHomeSection from 'components/HomeSection/Assets'
import AuctionsHomeSection from 'components/HomeSection/Auctions'
import CollectionsHomeSection from 'components/HomeSection/Collections'
import FeaturedHomeSection from 'components/HomeSection/Featured'
import ResourcesHomeSection from 'components/HomeSection/Resources'
import UsersHomeSection from 'components/HomeSection/Users'
import { NextPage } from 'next'
import { useMemo } from 'react'
import Head from '../components/Head'
import LargeLayout from '../layouts/large'

type Props = {
  now: number
}
const HomePage: NextPage<Props> = ({ now }) => {
  const date = useMemo(() => new Date(now), [now])
  return (
    <LargeLayout>
      <Head />
      <Stack spacing={12}>
        <FeaturedHomeSection date={date} />
        <CollectionsHomeSection />
        <UsersHomeSection />
        <AuctionsHomeSection date={date} />
        <AssetsHomeSection date={date} />
        <ResourcesHomeSection />
      </Stack>
    </LargeLayout>
  )
}

export default HomePage
