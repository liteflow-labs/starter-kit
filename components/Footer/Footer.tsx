import { Box, Divider, Flex, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Link from '../Link/Link'
import LiteflowLogo from './LiteflowLogo'

type Props = {
  name: string
  links: {
    href: string
    label: string
  }[]
}

const Footer: FC<Props> = ({ name, links }) => {
  const { t } = useTranslation('components')
  return (
    <>
      <Divider />
      <footer>
        <Box mx="auto" px={{ base: 6, lg: 8 }} maxW="80rem">
          <Flex justify="center">
            <Flex as="nav" wrap="wrap" justify="center" gap={6} pt={12} pb={8}>
              {links.map((link, i) =>
                link.href.match(/^[http|mailto]/) ? (
                  <Text
                    as="a"
                    color="gray.500"
                    fontWeight="medium"
                    cursor="pointer"
                    _hover={{
                      color: 'brand.black',
                    }}
                    href={link.href}
                    target="_blank"
                    rel="noopenner noreferrer"
                    key={i}
                  >
                    {link.label}
                  </Text>
                ) : (
                  <Link href={link.href} key={i}>
                    <Text
                      color="gray.500"
                      fontWeight="medium"
                      cursor="pointer"
                      _hover={{
                        color: 'brand.black',
                      }}
                    >
                      {link.label}
                    </Text>
                  </Link>
                ),
              )}
            </Flex>
          </Flex>
          <Divider />
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="center"
            pt={8}
            pb={14}
            gap={{ base: 4, md: 0 }}
          >
            <Text as="p" variant="text" color="gray.500" display="flex">
              {t('footer.copyright', {
                date: new Date().getFullYear(),
                name,
              })}
            </Text>
            <Flex>
              <Divider
                display={{ base: 'none', md: 'block' }}
                orientation="vertical"
                mx={6}
                color="gray.200"
                h={6}
              />
              <Text
                as="p"
                variant="text"
                color="gray.500"
                fontWeight="500"
                mr={1}
              >
                Powered by
              </Text>
              <Link href="https://liteflow.com" isExternal>
                {LiteflowLogo}
              </Link>
            </Flex>
          </Flex>
        </Box>
      </footer>
    </>
  )
}

export default Footer
