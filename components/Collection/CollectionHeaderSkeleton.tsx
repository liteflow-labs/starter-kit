import { Box, Divider, Flex, Skeleton, SkeletonText } from '@chakra-ui/react'
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
      <Flex alignItems="center" rowGap={2} columnGap={8} mt={4} flexWrap="wrap">
        <Flex flexDirection="column" justifyContent="center" py={2}>
          <Skeleton height="1em" width="100px" mb={2} />
          <Skeleton height="1em" width="50px" />
        </Flex>
        <Flex flexDirection="column" justifyContent="center" py={2}>
          <Skeleton height="1em" width="100px" mb={2} />
          <Skeleton height="1em" width="50px" />
        </Flex>
        <Flex flexDirection="column" justifyContent="center" py={2}>
          <Skeleton height="1em" width="100px" mb={2} />
          <Skeleton height="1em" width="50px" />
        </Flex>
        <Flex flexDirection="column" justifyContent="center" py={2}>
          <Skeleton height="1em" width="100px" mb={2} />
          <Skeleton height="1em" width="50px" />
        </Flex>
        <Divider orientation="vertical" height="40px" />
        <Flex flexDirection="column" justifyContent="center" py={2}>
          <Skeleton height="1em" width="100px" mb={2} />
          <Skeleton height="1em" width="50px" />
        </Flex>
      </Flex>
    </>
  )
}

export default CollectionHeaderSkeleton
