import { Flex, Heading, Tab, TabList, Tabs, Text } from '@chakra-ui/react'
import LargeLayout from 'layouts/large'
import useTranslation from 'next-translate/useTranslation'
import { FC, JSX } from 'react'
import Link from './Link/Link'

const ExploreTemplate: FC<{
  title: string
  search: string | null
  selectedTabIndex: number
  children: JSX.Element
}> = ({ title, search, selectedTabIndex, children }) => {
  const { t } = useTranslation('templates')
  const searchParam = search ? `?search=${search}` : ''

  return (
    <LargeLayout>
      <Flex justify="space-between" mb={{ base: 4, lg: 0 }} align="center">
        <Heading as="h1" variant="title" color="brand.black">
          {title}
        </Heading>
      </Flex>

      <Tabs
        defaultIndex={selectedTabIndex}
        colorScheme="brand"
        pt={10}
        pb={{ base: 2.5, md: 0 }}
        overflowX="auto"
      >
        <TabList gap={4}>
          <Tab
            as={Link}
            href={`/explore${searchParam}`}
            pb={4}
            whiteSpace="nowrap"
          >
            <Text as="span" variant="subtitle1">
              {t('explore.tabs.nfts')}
            </Text>
          </Tab>
          <Tab
            as={Link}
            href={`/explore/collections${searchParam}`}
            pb={4}
            whiteSpace="nowrap"
          >
            <Text as="span" variant="subtitle1">
              {t('explore.tabs.collections')}
            </Text>
          </Tab>
          <Tab
            as={Link}
            href={`/explore/users${searchParam}`}
            pb={4}
            whiteSpace="nowrap"
          >
            <Text as="span" variant="subtitle1">
              {t('explore.tabs.users')}
            </Text>
          </Tab>
        </TabList>
      </Tabs>
      {children}
    </LargeLayout>
  )
}

export default ExploreTemplate
