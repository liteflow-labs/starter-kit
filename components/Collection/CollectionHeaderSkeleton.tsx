import { Box, Skeleton, SkeletonText } from '@chakra-ui/react'
import { FC } from 'react'

const CollectionHeaderSkeleton: FC = () => {
  return (
    <>
      <Box position="relative" h={200} w="full">
        <Skeleton w="full" h="full" rounded={{ base: 'none', sm: '2xl' }} />
        <Skeleton
          position="absolute"
          bottom={-16}
          left={4}
          w={32}
          h={32}
          rounded="2xl"
          zIndex={1}
        />
      </Box>
      <SkeletonText
        noOfLines={1}
        height="2.25em"
        skeletonHeight="1em"
        width="200px"
        mt={24}
      />
      <SkeletonText
        noOfLines={1}
        height="1.75em"
        skeletonHeight="0.875em"
        width="200px"
        mt={4}
      />
    </>
  )
}

export default CollectionHeaderSkeleton
