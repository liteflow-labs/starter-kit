import { Button, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { HiOutlinePlus } from '@react-icons/all-files/hi/HiOutlinePlus'
import React, { FC } from 'react'
import Link from '../Link/Link'

type EmptyTypes = {
  icon?: JSX.Element
  title: string
  description?: string
  button?: string
  href?: string
}

const Empty: FC<EmptyTypes> = ({ icon, title, description, button, href }) => {
  return (
    <Stack minH="460px" align="center" justify="center" spacing={8}>
      <Flex
        as="span"
        bgColor="brand.50"
        h={12}
        w={12}
        align="center"
        justify="center"
        rounded="full"
      >
        {icon ? icon : <Icon as={HiOutlinePlus} w={8} h={8} color="gray.400" />}
      </Flex>
      <Stack spacing={1} textAlign="center">
        <Heading as="h3" variant="heading1" color="brand.black">
          {title}
        </Heading>
        {description && (
          <Heading as="h5" variant="heading3" color="gray.500">
            {description}
          </Heading>
        )}
      </Stack>
      {href && button && (
        <Button as={Link} href={href} size="lg">
          <Text as="span" isTruncated>
            {button}
          </Text>
        </Button>
      )}
    </Stack>
  )
}

export default Empty
