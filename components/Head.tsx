import NextHead from 'next/head'
import { FC, PropsWithChildren } from 'react'
import useEnvironment from '../hooks/useEnvironment'

type Props = {
  title: string
  description?: string
  image?: string
}

const Head: FC<PropsWithChildren<Props>> = ({
  title,
  description,
  image,
  children,
}) => {
  const { META_TITLE, META_DESCRIPTION, BASE_URL } = useEnvironment()
  const shortDescription = (description || META_DESCRIPTION).substring(0, 160)
  const siteTitle =
    title !== META_TITLE ? `${title} - ${META_TITLE}` : META_TITLE
  return (
    <NextHead>
      <title>{siteTitle}</title>
      <meta property="og:title" content={siteTitle} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="description" content={shortDescription} />
      <meta property="og:description" content={shortDescription} />
      <meta name="twitter:description" content={shortDescription} />
      <meta property="og:image" content={image || `${BASE_URL}/og-image.jpg`} />
      <meta
        name="twitter:image"
        content={image || `${BASE_URL}/twitter-card.jpg`}
      />
      {children}
    </NextHead>
  )
}

export default Head
