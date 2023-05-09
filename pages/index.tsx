import { Stack } from '@chakra-ui/react'
import AssetsHomeSection from 'components/HomeSection/Assets'
import AuctionsHomeSection from 'components/HomeSection/Auctions'
import CollectionsHomeSection from 'components/HomeSection/Collections'
import FeaturedHomeSection from 'components/HomeSection/Featured'
import { NextPage } from 'next'
import { useMemo } from 'react'
import LargeLayout from '../layouts/large'

type Props = {
  now: number
}
const HomePage: NextPage<Props> = ({ now }) => {
  const date = useMemo(() => new Date(now), [now])
  return (
    <LargeLayout>
      <Stack spacing={12}>
        <FeaturedHomeSection date={date} />
        <CollectionsHomeSection />
        <AuctionsHomeSection date={date} />
        <AssetsHomeSection date={date} />
      </Stack>
    </LargeLayout>
  )
}

export default HomePage
