import { Link as ChakraLink, LinkProps } from '@chakra-ui/react'
import NextLink from 'next/link'
import { forwardRef } from 'react'

type IProps = LinkProps & {
  href: string
}

const Link = forwardRef<any, IProps>(function Link(props, ref) {
  const { children, href, isExternal, ...rest } = props
  if (isExternal) {
    return (
      <ChakraLink ref={ref} href={href} isExternal {...rest}>
        {children}
      </ChakraLink>
    )
  }
  return (
    <NextLink passHref href={href}>
      <ChakraLink ref={ref} {...rest}>
        {children}
      </ChakraLink>
    </NextLink>
  )
})

export default Link
