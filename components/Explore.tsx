import {
  Flex,
  Heading,
  Spinner,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react'
import LargeLayout from 'layouts/large'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Link from './Link/Link'

const ExploreTemplate: FC<{
  title: string
  loading: boolean
  search: string | null
  selectedTabIndex: number
  children: JSX.Element
}> = ({ title, loading, search, selectedTabIndex, children }) => {
  const { t } = useTranslation('templates')
  const searchParam = search ? `?search=${search}` : ''

  return (
    <LargeLayout>
      <Flex justify="space-between" mb={{ base: 4, lg: 0 }} align="center">
        <Heading as="h1" variant="title" color="brand.black">
          {title}
        </Heading>

        {loading && <Spinner thickness="2px" speed="0.65s" />}
      </Flex>

      <Tabs
        defaultIndex={selectedTabIndex}
        colorScheme="brand"
        pt={10}
        pb={{ base: 2.5, md: 0 }}
        overflowX="auto"
      >
        <TabList>
          <Link href={`/explore${searchParam}`} whiteSpace="nowrap" mr={4}>
            <Tab borderColor="gray.200" pb={4} color="gray.500">
              <Text as="span" variant="subtitle1">
                {t('explore.tabs.nfts')}
              </Text>
            </Tab>
          </Link>
          <Link
            href={`/explore/collections${searchParam}`}
            whiteSpace="nowrap"
            mr={4}
          >
            <Tab borderColor="gray.200" pb={4} color="gray.500">
              <Text as="span" variant="subtitle1">
                {t('explore.tabs.collections')}
              </Text>
            </Tab>
          </Link>
          <Link
            href={`/explore/users${searchParam}`}
            whiteSpace="nowrap"
            mr={4}
          >
            <Tab borderColor="gray.200" pb={4} color="gray.500">
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
