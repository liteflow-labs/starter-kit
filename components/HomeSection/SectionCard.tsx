import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import Image from 'components/Image/Image'
import { FC } from 'react'
import Link from '../Link/Link'

type Props = {
  description?: string
  href: string
  isExternal?: boolean
  image?: string
  title: string
}

const HomeSectionCard: FC<Props> = ({
  description,
  href,
  isExternal,
  image,
  title,
}) => {
  return (
    <Link href={href} isExternal={isExternal} w="full">
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        shadow="sm"
        w="full"
        overflow="hidden"
      >
        <Box height="7.5rem">
          {image ? (
            <Image
              src={image}
              alt={title}
              layout="fill"
              objectFit="cover"
              sizes="
              (min-width: 80em) 292px,
              (min-width: 62em) 25vw,
              50vw"
            />
          ) : (
            <Box bg="gray.200" height="full" />
          )}
        </Box>
        <Flex
          direction="column"
          justify="center"
          overflow="hidden"
          p={4}
          gap={1}
        >
          <Heading as="h3" variant="heading2" title={title} isTruncated>
            {title}
          </Heading>
          {description && (
            <Text
              variant="subtitle2"
              color="gray.500"
              title={description}
              noOfLines={2}
            >
              {description}
            </Text>
          )}
        </Flex>
      </Box>
    </Link>
  )
}

export default HomeSectionCard
