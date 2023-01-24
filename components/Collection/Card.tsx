import { Flex, Heading } from '@chakra-ui/react'
import { VFC } from 'react'
import { COLORS } from 'styles/theme'
import Link from '../Link/Link'

export type Props = {
  image: string
  title: string
  collectionAddress: string
}

const CollectionCard: VFC<Props> = ({ image, title, collectionAddress }) => {
  const href = `/explore?collections=${collectionAddress}`

  return (
    <Flex
      flex={1}
      direction="column"
      overflow="hidden"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.200"
      bgColor="white"
      as={Link}
      href={href}
    >
      <Flex w="100%" h={48} pos="relative">
        <img src={image} alt={title} style={{ objectFit: 'cover' }} />

        <Flex
          pos="absolute"
          p={6}
          w="100%"
          h="100%"
          bgColor={COLORS.brand[500] + 'b3'}
          transition="background-color 0.13s ease-in"
          _hover={{ bgColor: 'brand.500' }}
          alignItems="center"
          justifyContent="center"
        >
          <Heading
            as="h4"
            fontSize={24}
            variant="heading2"
            color="white"
            title={title}
            isTruncated
          >
            {title}
          </Heading>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default CollectionCard
