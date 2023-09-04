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
  const { META_TITLE, BASE_URL } = useEnvironment()
  const shortDescription = description?.substring(0, 160)
  return (
    <NextHead>
      <title>
        {title && title !== META_TITLE
          ? `${title} - ${META_TITLE}`
          : META_TITLE}
      </title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      {shortDescription && (
        <>
          <meta name="description" content={shortDescription} />
          <meta property="og:description" content={shortDescription} />
          <meta name="twitter:description" content={shortDescription} />
        </>
      )}
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
