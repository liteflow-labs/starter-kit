import { Box, Flex, Skeleton, SkeletonText } from '@chakra-ui/react'
import { FC } from 'react'

const DropHeaderSkeleton: FC = () => {
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
        display="flex"
        alignItems="center"
        noOfLines={1}
        height="2.25em"
        skeletonHeight="1.25em"
        width="200px"
        mt={24}
      />
      <SkeletonText
        display="flex"
        alignItems="center"
        noOfLines={1}
        height="1.75em"
        skeletonHeight="0.875em"
        width="200px"
        mt={2}
      />
      <Box mt={4}>
        <SkeletonText noOfLines={2} spacing={4} skeletonHeight="0.875em" />
      </Box>
      <Flex flexDirection="column" justifyContent="center" mt={4} py={2}>
        <Skeleton height="1em" width="100px" mb={2} />
        <Skeleton height="1em" width="50px" />
      </Flex>
    </>
  )
}

export default DropHeaderSkeleton
