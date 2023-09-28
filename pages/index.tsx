import { Stack, useConst } from '@chakra-ui/react'
import AssetsHomeSection from 'components/HomeSection/Assets'
import AuctionsHomeSection from 'components/HomeSection/Auctions'
import CollectionsHomeSection from 'components/HomeSection/Collections'
import FeaturedHomeSection from 'components/HomeSection/Featured'
import ResourcesHomeSection from 'components/HomeSection/Resources'
import UsersHomeSection from 'components/HomeSection/Users'
import { NextPage } from 'next'
import Head from '../components/Head'
import LargeLayout from '../layouts/large'

const HomePage: NextPage = () => {
  const mountTime = useConst(() => new Date())
  return (
    <LargeLayout>
      <Head />
      <Stack spacing={12}>
        <FeaturedHomeSection date={mountTime} />
        <CollectionsHomeSection />
        <UsersHomeSection />
        <AuctionsHomeSection date={mountTime} />
        <AssetsHomeSection date={mountTime} />
        <ResourcesHomeSection />
      </Stack>
    </LargeLayout>
  )
}

export default HomePage
