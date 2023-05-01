import { Flex, Skeleton, Stack } from '@chakra-ui/react'
import { FC } from 'react'

type Props = {
  items: number
}

const SkeletonProperty: FC<Props> = ({ items }) => {
  return (
    <Flex width="full">
      {Array.from({ length: items }).map((_, i) => (
        <Stack gap={0.5} width="100%" key={i}>
          <Skeleton height="24px" width="40%" />
          <Skeleton height="32px" width="80%" />
        </Stack>
      ))}
    </Flex>
  )
}

export default SkeletonProperty
