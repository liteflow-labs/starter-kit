import { Box, Divider, Flex, Stack, Text } from '@chakra-ui/react'
import React, { PropsWithChildren } from 'react'

type ListItemProps = {
  image: JSX.Element
  label: JSX.Element | string
  subtitle?: JSX.Element | string
  caption?: JSX.Element | string
  action?: JSX.Element
  withSeparator?: boolean
}

export function ListItem({
  label,
  action,
  caption,
  image,
  subtitle,
  withSeparator,
  ...props
}: ListItemProps): JSX.Element {
  return (
    <Stack as="li" {...props}>
      <Flex align="center" gap={3}>
        <Flex
          mb="auto"
          h={10}
          w={10}
          minW="max-content"
          align="center"
          justify="center"
          overflow="hidden"
          rounded="full"
          bgColor="gray.100"
        >
          {image}
        </Flex>
        <Flex
          flex={1}
          direction={{ base: 'column', md: 'row' }}
          align="center"
          gap={3}
        >
          <Box w="full" overflow="hidden">
            <Text as="p" variant="text-sm" color="gray.500">
              {label}
            </Text>
            {subtitle && (
              <Text as="p" variant="text-sm" color="gray.500">
                {subtitle}
              </Text>
            )}
            {caption && (
              <Text as="p" variant="text-sm" color="gray.500">
                {caption}
              </Text>
            )}
          </Box>
          {action && (
            <Box w={{ base: 'full', md: 'auto' }} minW="max-content">
              {action}
            </Box>
          )}
        </Flex>
      </Flex>
      {withSeparator && <Divider pt={1} />}
    </Stack>
  )
}

export default function List({
  children,
  ...props
}: PropsWithChildren<{}>): JSX.Element {
  return (
    <Stack as="ul" position="relative" spacing={6} {...props}>
      {children}
    </Stack>
  )
}
