import {
  Box,
  Divider,
  Flex,
  Icon,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import { HiXCircle } from '@react-icons/all-files/hi/HiXCircle'
import { JSX, PropsWithChildren } from 'react'

export type ListItemProps = StackProps & {
  image?: JSX.Element
  imageRounded?: string
  imageSize?: number
  label: JSX.Element | string
  subtitle?: JSX.Element | string
  caption?: JSX.Element | string
  action?: JSX.Element
  withSeparator?: boolean
  closable?: boolean
}

export function ListItem({
  label,
  action,
  caption,
  image,
  imageRounded,
  imageSize,
  subtitle,
  withSeparator,
  closable,
  ...props
}: ListItemProps): JSX.Element {
  return (
    <Stack {...props} as="li" padding={2}>
      <Flex align="center" gap={3}>
        {image && (
          <Flex
            mb={imageSize ? '0' : 'auto'}
            h={imageSize ? imageSize : 10}
            w={imageSize ? imageSize : 10}
            minW="max-content"
            align="center"
            justify="center"
            overflow="hidden"
            rounded={imageRounded || 'full'}
            bgColor="gray.100"
          >
            {image}
          </Flex>
        )}
        <Flex flex={1} align="center" gap={4}>
          <Box w="full" overflow="hidden">
            <Text
              as="div"
              variant="text-sm"
              color="gray.500"
              noOfLines={1}
              wordBreak="break-word"
            >
              {label}
            </Text>
            {subtitle && (
              <Text
                as="div"
                variant="text-sm"
                color="gray.500"
                noOfLines={1}
                wordBreak="break-word"
              >
                {subtitle}
              </Text>
            )}
            {caption && (
              <Text
                as="div"
                variant="text-sm"
                color="gray.500"
                noOfLines={1}
                wordBreak="break-word"
              >
                {caption}
              </Text>
            )}
          </Box>
          {action && (
            <Box w={{ base: 'full', md: 'auto' }} minW="max-content">
              {action}
            </Box>
          )}
          {closable && <Icon as={HiXCircle} h={4} w={4} />}
        </Flex>
      </Flex>
      {withSeparator && <Divider pt={1} />}
    </Stack>
  )
}

export type ListProps = StackProps

export default function List({
  children,
  ...props
}: PropsWithChildren<{}>): JSX.Element {
  return (
    <Stack as="ul" position="relative" {...props}>
      {children}
    </Stack>
  )
}
