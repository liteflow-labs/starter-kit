import { useEffect, useMemo, useState } from 'react'
import { dateIsBefore, dateIsBetween } from '../utils'

export enum Timeline {
  UPCOMING = 'upcoming',
  INPROGRESS = 'inprogress',
  ENDED = 'ended',
}

type HookArgs = {
  drop: {
    startDate: Date
    endDate: Date
  }
}

export default function useDropTimeline({ drop }: HookArgs): Timeline {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(interval)
  })

  return useMemo(() => {
    if (dateIsBefore(date, drop.startDate)) return Timeline.UPCOMING
    if (dateIsBetween(date, drop.startDate, drop.endDate))
      return Timeline.INPROGRESS
    return Timeline.ENDED
  }, [date, drop.endDate, drop.startDate])
}
