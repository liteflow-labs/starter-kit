import {
  Flex,
  Heading,
  Link,
  Spinner,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react'
import LargeLayout from 'layouts/large'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Head from './Head'

const ExploreTemplate: FC<{
  title: string
  loading: boolean
  search: string | null
  tabIndex: number
  children: JSX.Element
}> = ({ title, loading, search, tabIndex, children }) => {
  const { t } = useTranslation('templates')

  return (
    <LargeLayout>
      <Head title={title} />

      <Flex justify="space-between" mb={{ base: 4, lg: 0 }} align="center">
        <Heading as="h1" variant="title" color="brand.black">
          {title}
        </Heading>

        {loading && <Spinner thickness="2px" speed="0.65s" />}
      </Flex>

      <Tabs
        defaultIndex={tabIndex}
        colorScheme="brand"
        pt={10}
        pb={{ base: 2.5, md: 0 }}
        overflowX="auto"
      >
        <TabList>
          <Link
            href={search ? `/explore?search=${search}` : '/explore'}
            whiteSpace="nowrap"
            mr={4}
          >
            <Tab as="div" borderColor="gray.200" pb={4} color="gray.500">
              <Text as="span" variant="subtitle1">
                {t('explore.tabs.nfts')}
              </Text>
            </Tab>
          </Link>
          <Link
            href={search ? `/explore/users?search=${search}` : '/explore/users'}
            whiteSpace="nowrap"
          >
            <Tab as="div" borderColor="gray.200" pb={4} color="gray.500">
              <Text as="span" variant="subtitle1">
                {t('explore.tabs.users')}
              </Text>
            </Tab>
          </Link>
        </TabList>
      </Tabs>
      {children}
    </LargeLayout>
  )
}

export default ExploreTemplate
