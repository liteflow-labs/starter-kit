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
  return (
    <NextHead>
      <title>
        {title && title !== META_TITLE
          ? `${title} - ${META_TITLE}`
          : META_TITLE}
      </title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
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
