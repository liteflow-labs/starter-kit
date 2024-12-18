import { StyleProps, VStack } from '@chakra-ui/react'
import { FC, useEffect, useMemo, useState } from 'react'
import { dateIsBefore, dateIsBetween } from '../../../utils'
import MintFormEnded from './Ended'
import MintFormInprogress from './Inprogress'
import MintFormUpcoming from './Upcoming'

type Props = StyleProps & {
  collection: {
    address: string
    chainId: number
  }
  drops: {
    id: string
    name: string
    endDate: Date
    startDate: Date
    unitPrice: string
    minted: string
    supply: string | null
    maxQuantityPerWallet: string | null
    isAllowed: boolean
    maxQuantity: string | null
    currency: {
      decimals: number
      symbol: string
      image: string
    }
  }[]
}

const DropMintForm: FC<Props> = ({ collection, drops, ...props }) => {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(interval)
  })

  const inprogressDrops = useMemo(
    () =>
      drops.filter((drop) =>
        dateIsBetween(date, drop.startDate, drop.endDate),
      ) || [],
    [date, drops],
  )

  const upcomingDrops = useMemo(
    () => drops.filter((drop) => dateIsBefore(date, drop.startDate)) || [],
    [date, drops],
  )

  const dropsToRender = useMemo(() => {
    if (inprogressDrops.length > 0 && inprogressDrops[0])
      return (
        <MintFormInprogress collection={collection} drop={inprogressDrops[0]} />
      )
    if (upcomingDrops.length > 0 && upcomingDrops[0])
      return <MintFormUpcoming drop={upcomingDrops[0]} />
    return <MintFormEnded collection={collection} drops={drops} />
  }, [drops, inprogressDrops, upcomingDrops, collection])

  return (
    <VStack align="stretch" spacing={3} {...props}>
      {dropsToRender}
    </VStack>
  )
}

export default DropMintForm
