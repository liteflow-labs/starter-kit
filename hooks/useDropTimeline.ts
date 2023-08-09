import { useMemo } from 'react'
import { dateIsBefore, dateIsBetween } from '../utils'

export enum Timeline {
  UPCOMING = 'upcoming',
  INPROGRESS = 'inprogress',
  ENDED = 'ended',
}

type HookArgs = {
  now: Date
  drop: {
    startDate: Date
    endDate: Date
  }
}

export default function useDropTimeline({ now, drop }: HookArgs): Timeline {
  return useMemo(() => {
    if (dateIsBefore(now, drop.startDate)) return Timeline.UPCOMING
    if (dateIsBetween(now, drop.startDate, drop.endDate))
      return Timeline.INPROGRESS
    return Timeline.ENDED
  }, [drop.endDate, drop.startDate, now])
}
