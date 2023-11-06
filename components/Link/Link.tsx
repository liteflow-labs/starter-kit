import { Link as ChakraLink, Flex, LinkProps } from '@chakra-ui/react'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { forwardRef } from 'react'
import invariant from 'ts-invariant'

type IProps = Omit<LinkProps, 'href'> &
  NextLinkProps & {
    externalIcon?: boolean
  }

const Link = forwardRef<any, IProps>(function Link(props, ref) {
  const { children, href, isExternal, externalIcon, ...rest } = props
  if (isExternal) {
    invariant(
      typeof href === 'string',
      'If you provide `isExternal` prop, `href` must be a string',
    )
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
