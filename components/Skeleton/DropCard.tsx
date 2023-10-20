import { AspectRatio, Skeleton } from '@chakra-ui/react'
import { FC } from 'react'

const SkeletonDropCard: FC = () => {
  return (
    <AspectRatio ratio={2.23}>
      <Skeleton borderRadius="2xl" />
    </AspectRatio>
  )
}

export default SkeletonDropCard
