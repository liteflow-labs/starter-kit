import { ResponsiveValue, SimpleGrid, SimpleGridProps } from '@chakra-ui/react'
import { FC, Fragment } from 'react'

type Props = SimpleGridProps & {
  items: number
  compact?: boolean
  columns?: ResponsiveValue<number>
}

const SkeletonGrid: FC<Props> = ({
  items,
  compact,
  columns,
  children,
  ...props
}) => {
  return (
    <SimpleGrid
      spacing={compact ? 4 : 6}
      columns={columns ?? { base: 1, sm: 2, md: 3, lg: 4 }}
      {...props}
    >
      {Array.from({ length: items }).map((_, i) => (
        <Fragment key={i}>{children}</Fragment>
      ))}
    </SimpleGrid>
  )
}

export default SkeletonGrid
