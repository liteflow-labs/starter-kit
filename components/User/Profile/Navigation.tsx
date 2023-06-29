import { Tab, TabList, Tabs, Tag, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { useMemo, VFC } from 'react'
import Link from '../../Link/Link'

export type TabsEnum =
  | 'on-sale'
  | 'owned'
  | 'created'
  | 'bids'
  | 'trades'
  | 'offers'

export type IProps = {
  baseUrl: string
  showPrivateTabs: boolean
  currentTab: TabsEnum
  totals: Map<TabsEnum, number | undefined>
}

type Tab = {
  title: string
  count?: number
  type: TabsEnum
  href: string
}

const UserProfileNavigation: VFC<IProps> = ({
  baseUrl,
  showPrivateTabs,
  currentTab,
  totals,
}) => {
  const { t } = useTranslation('components')
  const tabs = useMemo(
    () => [
      {
        title: t('user.navigation.on-sale'),
        count: totals.get('on-sale'),
        type: 'on-sale',
        href: `${baseUrl}/on-sale`,
      } as Tab,
      {
        title: t('user.navigation.owned'),
        count: totals.get('owned'),
        type: 'owned',
        href: `${baseUrl}/owned`,
      } as Tab,
      {
        title: t('user.navigation.created'),
        count: totals.get('created'),
        type: 'created',
        href: `${baseUrl}/created`,
      } as Tab,
      {
        title: t('user.navigation.bids'),
        type: 'bids',
        href: `${baseUrl}/bids`,
      } as Tab,
      ...(showPrivateTabs
        ? [
            {
              title: t('user.navigation.trades'),
              type: 'trades',
              href: `${baseUrl}/trades`,
            } as Tab,
            {
              title: t('user.navigation.offers'),
              type: 'offers',
              href: `${baseUrl}/offers`,
            } as Tab,
          ]
        : []),
    ],
    [totals, showPrivateTabs, baseUrl, t],
  )

  const defaultIndex = useMemo(
    () => tabs.findIndex((val) => val.type === currentTab),
    [tabs, currentTab],
  )
  return (
    <Tabs
      isManual
      defaultIndex={defaultIndex}
      colorScheme="brand"
      pb={{ base: 2.5, md: 0 }}
      overflowX="auto"
    >
      <TabList gap={4}>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            as={Link}
            href={tab.href}
            whiteSpace="nowrap"
            gap={2}
          >
            <Text as="span" variant="subtitle1">
              {tab.title}
            </Text>
            {tab.count !== undefined && <Tag color="inherit">{tab.count}</Tag>}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}

export default UserProfileNavigation
