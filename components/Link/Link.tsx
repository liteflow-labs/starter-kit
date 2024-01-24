import { Box, Link as ChakraLink, Flex, LinkProps } from '@chakra-ui/react'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'

type IProps = Omit<LinkProps, 'href'> &
  Omit<NextLinkProps, 'href'> & {
    externalIcon?: boolean
    condition?: boolean
  } & (
    | { isExternal: true; href: LinkProps['href'] }
    | { isExternal?: false; href: NextLinkProps['href'] }
  )

const Link = forwardRef<any, IProps>(function Link(props, ref) {
  const { children, href, isExternal, externalIcon, condition, ...rest } = props
  if (condition === false) return <Box {...rest}>{children}</Box>
  if (isExternal) {
    return (
      <ChakraLink
        ref={ref}
        href={href}
        rel="noopener noreferrer nofollow"
        isExternal
        {...rest}
      >
        {externalIcon ? (
          <Flex alignItems="center" as="span">
            {children}
            <>
              &nbsp;
              <HiOutlineExternalLink />
            </>
          </Flex>
        ) : (
          children
        )}
      </ChakraLink>
    )
  }
  return (
    <NextLink passHref href={href} legacyBehavior>
      <ChakraLink ref={ref} {...rest}>
        {children}
      </ChakraLink>
    </NextLink>
  )
})

export default Link
