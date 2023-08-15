import { Tab, TabList, Tabs, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
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
}

const UserProfileNavigation: FC<IProps> = ({
  baseUrl,
  showPrivateTabs,
  currentTab,
}) => {
  const { t } = useTranslation('components')
  const tabs = useMemo(
    () => [
      {
        title: t('user.navigation.on-sale'),
        type: 'on-sale',
        href: `${baseUrl}/on-sale`,
      },
      {
        title: t('user.navigation.owned'),
        type: 'owned',
        href: `${baseUrl}/owned`,
      },
      {
        title: t('user.navigation.created'),
        type: 'created',
        href: `${baseUrl}/created`,
      },
      {
        title: t('user.navigation.bids'),
        type: 'bids',
        href: `${baseUrl}/bids`,
      },
      ...(showPrivateTabs
        ? [
            {
              title: t('user.navigation.trades'),
              type: 'trades',
              href: `${baseUrl}/trades`,
            },
            {
              title: t('user.navigation.offers'),
              type: 'offers',
              href: `${baseUrl}/offers`,
            },
          ]
        : []),
    ],
    [showPrivateTabs, baseUrl, t],
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
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}

export default UserProfileNavigation
