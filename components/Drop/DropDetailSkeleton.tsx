import { Flex, Progress, SimpleGrid, Skeleton } from '@chakra-ui/react'
import { FC } from 'react'

type Props = {
  items?: number
}

const DropDetailSkeleton: FC<Props> = ({ items = 4 }) => {
  return (
    <>
      <Flex flexDirection="column" py={8} gap={2} width="full">
        <Flex justifyContent="space-between" py={2} w="full">
          <Skeleton height="1em" width="100px" />
          <Skeleton height="1em" width="100px" />
        </Flex>
        <Progress colorScheme="brand" rounded="full" size="xs" value={0} />
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} height={28} borderRadius="2xl" />
        ))}
      </SimpleGrid>
    </>
  )
}

export default DropDetailSkeleton
