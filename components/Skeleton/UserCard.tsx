import { AspectRatio, Skeleton } from '@chakra-ui/react'
import { FC } from 'react'

const SkeletonUserCard: FC = () => {
  return (
    <AspectRatio ratio={1.4}>
      <Skeleton borderRadius="2xl" />
    </AspectRatio>
  )
}

export default SkeletonUserCard
