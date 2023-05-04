import { Flex, Link as ChakraLink, LinkProps } from '@chakra-ui/react'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import NextLink from 'next/link'
import { forwardRef } from 'react'

type IProps = LinkProps & {
  href: string
  externalIcon?: boolean
}

const Link = forwardRef<any, IProps>(function Link(props, ref) {
  const { children, href, isExternal, externalIcon, ...rest } = props
  if (isExternal) {
    return (
      <ChakraLink ref={ref} href={href} isExternal {...rest}>
        <Flex alignItems="center">
          {children}
          {externalIcon && (
            <>
              &nbsp;
              <HiOutlineExternalLink />
            </>
          )}
        </Flex>
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
