import { SimpleGrid } from '@chakra-ui/react'
import { FC } from 'react'
import SkeletonCard from './TokenCard'

type Props = {
  items: number
}

const SkeletonGrid: FC<Props> = ({ items }) => {
  return (
    <SimpleGrid spacing={6} columns={{ sm: 2, md: 3, lg: 4 }}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </SimpleGrid>
  )
}

export default SkeletonGrid
