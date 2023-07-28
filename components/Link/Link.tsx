import { Link as ChakraLink, Flex, LinkProps } from '@chakra-ui/react'
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
