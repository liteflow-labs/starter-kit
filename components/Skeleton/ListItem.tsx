import { Flex, Skeleton, Stack, StackProps } from '@chakra-ui/react'
import { FC } from 'react'

type Props = StackProps & {
  image?: boolean
  subtitle?: boolean
  caption?: boolean
}

const SkeletonListItem: FC<Props> = ({ caption, image, subtitle }) => {
  return (
    <Stack as="li" padding={2}>
      <Flex align="center" gap={3}>
        {image && <Skeleton h={10} w={10} borderRadius="full" />}
        <Flex flex={1} gap={1} direction="column">
          <Skeleton height="15px" width="250px" />
          {subtitle && <Skeleton height="15px" width="300px" />}
          {caption && <Skeleton height="15px" width="100px" />}
        </Flex>
      </Flex>
    </Stack>
  )
}

export default SkeletonListItem
