import { Skeleton, Stack } from '@chakra-ui/react'
import { FC } from 'react'

type Props = {
  items: number
}

const SkeletonForm: FC<Props> = ({ items }) => {
  return (
    <Stack w="full" spacing={8}>
      {Array.from({ length: items }).map((_, i) => (
        <Stack key={i} gap={2}>
          <Skeleton width="100px" height="24px" />
          <Skeleton width="100%" height="40px" rounded="2xl" />
        </Stack>
      ))}
      <Skeleton width="100%" height="48px" rounded="2xl" />
    </Stack>
  )
}

export default SkeletonForm
