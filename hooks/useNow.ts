import { useEffect, useState } from 'react'

export default function useNow(): Date {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(interval)
  })

  return date
}
