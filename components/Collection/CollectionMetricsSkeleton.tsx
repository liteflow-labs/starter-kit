import { Divider, Flex, Skeleton } from '@chakra-ui/react'
import { FC } from 'react'

const CollectionMetricsSkeletonItem = () => (
  <Flex flexDirection="column" justifyContent="center" py={2}>
    <Skeleton height="1em" width="100px" mb={2} />
    <Skeleton height="1em" width="50px" />
  </Flex>
)

const CollectionMetricsSkeleton: FC = () => {
  return (
    <Flex alignItems="center" rowGap={2} columnGap={8} mt={4} flexWrap="wrap">
      <CollectionMetricsSkeletonItem />
      <CollectionMetricsSkeletonItem />
      <CollectionMetricsSkeletonItem />
      <CollectionMetricsSkeletonItem />
      <Divider orientation="vertical" height="40px" />
      <CollectionMetricsSkeletonItem />
    </Flex>
  )
}

export default CollectionMetricsSkeleton
