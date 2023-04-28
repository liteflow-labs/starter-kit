import { AspectRatio, Skeleton } from '@chakra-ui/react'
import { FC } from 'react'

const SkeletonTokenCard: FC = () => {
  return (
    <AspectRatio ratio={0.75}>
      <Skeleton borderRadius="2xl" />
    </AspectRatio>
  )
}

export default SkeletonTokenCard
