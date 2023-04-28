import { AspectRatio, Skeleton } from '@chakra-ui/react'
import { FC } from 'react'

const SkeletonCollectionCard: FC = () => {
  return (
    <AspectRatio ratio={0.86}>
      <Skeleton borderRadius="2xl" />
    </AspectRatio>
  )
}

export default SkeletonCollectionCard
