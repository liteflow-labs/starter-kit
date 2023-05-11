import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import HomeGridSection from './Grid'
import HomeSectionCard from './SectionCard'

type Props = {}

// TODO: to be changed
const items = [
  {
    href: '/explore',
    isExternal: false,
    image: '',
    title: 'Card title looooooong',
    description: 'Card subtext - Lorem ipsum dolor es looooooong',
  },
  {
    href: 'https://liteflow.com/',
    isExternal: true,
    image: '',
    title: 'Card title',
    description: 'Card subtext - Lorem ipsum dolor es',
  },
  {
    href: '/explore/collections',
    isExternal: false,
    image: '',
    title: 'Card title',
    description: 'Card subtext - Lorem ipsum dolor es',
  },
  {
    href: 'https://liteflow.com/about/',
    isExternal: true,
    image: '',
    title: 'Card title',
    description: 'Card subtext - Lorem ipsum dolor es',
  },
  {
    href: '/explore/users',
    isExternal: false,
    image: '',
    title: 'Card title',
    description: 'Card subtext - Lorem ipsum dolor es',
  },
]

const ResourcesHomeSection: FC<Props> = () => {
  const { t } = useTranslation('templates')

  return (
    <HomeGridSection
      isLoading={false}
      items={items}
      itemRender={(item: typeof items[0]) => (
        <HomeSectionCard
          href={item.href}
          isExternal={item.isExternal}
          image={item.image}
          title={item.title}
          description={item.description}
        />
      )}
      title={t('home.resources')}
    />
  )
}

export default ResourcesHomeSection
