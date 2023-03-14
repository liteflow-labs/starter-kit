import ReactLinkify from 'react-linkify'
import Link from '../Link/Link'

export default function linkify(children: string): JSX.Element {
  return (
    <ReactLinkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <Link
          isExternal
          href={decoratedHref}
          key={key}
          _hover={{ color: 'brand.500' }}
        >
          {decoratedText}
        </Link>
      )}
    >
      {children}
    </ReactLinkify>
  )
}
