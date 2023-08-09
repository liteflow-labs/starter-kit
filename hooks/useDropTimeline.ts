import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useMemo } from 'react'

dayjs.extend(isBetween)

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
    if (dayjs(now).isBefore(dayjs(drop.startDate))) return Timeline.UPCOMING
    if (dayjs(now).isBetween(dayjs(drop.startDate), dayjs(drop.endDate)))
      return Timeline.INPROGRESS
    return Timeline.ENDED
  }, [drop.endDate, drop.startDate, now])
}
