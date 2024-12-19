import { useEffect, useMemo, useState } from 'react'
import { dateIsAfter, dateIsBefore } from '../utils'

export enum Status {
  UPCOMING = 'upcoming',
  INPROGRESS = 'inprogress',
  ENDED = 'ended',
}

type HookArgs = {
  startDate: Date
  endDate: Date | null
}

export default function useTimeStatus({
  endDate,
  startDate,
}: HookArgs): Status {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(interval)
  })

  return useMemo(() => {
    if (dateIsBefore(date, startDate)) return Status.UPCOMING
    if (endDate && dateIsAfter(date, endDate)) return Status.ENDED
    return Status.INPROGRESS
  }, [date, endDate, startDate])
}
