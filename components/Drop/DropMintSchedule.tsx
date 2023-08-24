import { StyleProps, VStack } from '@chakra-ui/react'
import { FC } from 'react'
import DropListItem from './ListItem'

type Props = StyleProps & {
  drops: {
    id: string
    name: string
    startDate: Date
    endDate: Date
    unitPrice: string
    isAllowed: boolean
    currency: {
      id: string
      decimals: number
      symbol: string
      image: string
    }
    supply: string | null
    maxQuantityPerWallet: string | null
  }[]
}

const DropMintSchedule: FC<Props> = ({ drops, ...props }) => {
  return (
    <VStack align="stretch" spacing={3} {...props}>
      {drops.map((drop, index) => (
        <DropListItem key={drop.id} drop={drop} isOpen={index === 0} />
      ))}
    </VStack>
  )
}

export default DropMintSchedule
