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
import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import Head from './Head'

const ExploreTemplate: FC<{
  title: string
  loading: boolean
  search: string | null
  selectedTabIndex: number
  children: JSX.Element
}> = ({ title, loading, search, selectedTabIndex, children }) => {
  const { t } = useTranslation('templates')
  const { replace } = useRouter()

  const handleTabClick = useCallback(
    async (tabHref: string) => {
      if (search) {
        return await replace({
          pathname: tabHref,
          query: { search },
        })
      }
      return await replace({
        pathname: tabHref,
      })
    },
    [replace, search],
  )

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
        defaultIndex={selectedTabIndex}
        colorScheme="brand"
        pt={10}
        pb={{ base: 2.5, md: 0 }}
        overflowX="auto"
      >
        <TabList>
          <Link
            onClick={() => handleTabClick('/explore')}
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
            onClick={() => handleTabClick('/explore/users')}
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
