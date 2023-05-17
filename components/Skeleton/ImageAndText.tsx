import { Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { FC } from 'react'

type Props = {
  large?: boolean
}

const SkeletonImageAndText: FC<Props> = ({ large }) => {
  return (
    <Flex align="center" gap={2}>
      <SkeletonCircle />
      <Skeleton
        width={large ? '150px' : '100px'}
        height={large ? '1.5em' : '1em'}
      />
    </Flex>
  )
}

export default SkeletonImageAndText
