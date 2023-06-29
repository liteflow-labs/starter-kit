import { Heading, Tab, TabList, Tabs, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, PropsWithChildren, useMemo } from 'react'
import Link from '../Link/Link'

export type AccountTabs = 'wallet' | 'edit-profile'

type Tab = {
  title: string
  href: string
  type: AccountTabs
}

const AccountTemplate: FC<
  PropsWithChildren<{
    currentTab: string
  }>
> = ({ children, currentTab }) => {
  const { t } = useTranslation('components')
  const tabs = useMemo(
    () => [
      {
        title: t('account.tabs.wallet'),
        href: '/account/wallet',
        type: 'wallet',
      } as Tab,
      {
        title: t('account.tabs.edit-profile'),
        href: '/account/edit',
        type: 'edit-profile',
      } as Tab,
    ],
    [t],
  )
  const defaultIndex = tabs.findIndex(({ type }) => type === currentTab)
  return (
    <>
      <Heading as="h1" variant="title" color="brand.black" pb={6}>
        {t('account.title')}
      </Heading>
      <Tabs
        isManual
        defaultIndex={defaultIndex}
        colorScheme="brand"
        overflowX="auto"
      >
        <TabList gap={4}>
          {tabs.map((tab, index) => (
            <Tab key={index} as={Link} href={tab.href} whiteSpace="nowrap">
              <Text as="span" variant="subtitle1">
                {tab.title}
              </Text>
            </Tab>
          ))}
        </TabList>
      </Tabs>
      {children}
    </>
  )
}

export default AccountTemplate
