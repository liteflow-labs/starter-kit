import { VStack } from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import { convertDropDetail } from '../../../convert'
import useNow from '../../../hooks/useNow'
import { dateIsBefore, dateIsBetween } from '../../../utils'
import MintFormEnded from './Ended'
import MintFormInprogress from './Inprogress'
import MintFormUpcoming from './Upcoming'

type Props = {
  collection: {
    address: string
    chainId: number
  }
  drops: ReturnType<typeof convertDropDetail>[]
}

const DropMintForm: FC<Props> = ({ collection, drops }) => {
  const now = useNow()

  const inprogressDrops = useMemo(
    () =>
      drops.filter((drop) =>
        dateIsBetween(now, drop.startDate, drop.endDate),
      ) || [],
    [now, drops],
  )

  const upcomingDrops = useMemo(
    () => drops.filter((drop) => dateIsBefore(now, drop.startDate)) || [],
    [now, drops],
  )

  const dropsToRender = useMemo(() => {
    if (inprogressDrops.length > 0)
      return inprogressDrops.map((drop) => (
        <MintFormInprogress key={drop.id} collection={collection} drop={drop} />
      ))
    if (upcomingDrops.length > 0)
      return upcomingDrops.map((drop) => (
        <MintFormUpcoming key={drop.id} drop={drop} />
      ))
    return <MintFormEnded collection={collection} drops={drops} />
  }, [drops, inprogressDrops, upcomingDrops, collection])

  return (
    <VStack align="stretch" spacing={3}>
      {dropsToRender}
    </VStack>
  )
}

export default DropMintForm
