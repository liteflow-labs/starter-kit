import { Stack } from '@chakra-ui/react'
import AssetsHomeSection from 'components/HomeSection/Assets'
import CollectionsHomeSection from 'components/HomeSection/Collections'
import FeaturedHomeSection from 'components/HomeSection/Featured'
import ResourcesHomeSection from 'components/HomeSection/Resources'
import UsersHomeSection from 'components/HomeSection/Users'
import { NextPage } from 'next'
import { useCallback, useState } from 'react'
import Head from '../components/Head'
import useCart from '../hooks/useCart'
import LargeLayout from '../layouts/large'

type Props = {
  now: number
}
const HomePage: NextPage<Props> = ({ now }) => {
  const [date, setDate] = useState(new Date(now))
  const updateDate = useCallback(() => setDate(new Date()), [])
  useCart({ onCheckout: updateDate })
  return (
    <LargeLayout>
      <Head />
      <Stack spacing={12}>
        <FeaturedHomeSection date={date} />
        <CollectionsHomeSection />
        <UsersHomeSection />
        <AssetsHomeSection date={date} />
        <ResourcesHomeSection />
      </Stack>
    </LargeLayout>
  )
}

export default HomePage
