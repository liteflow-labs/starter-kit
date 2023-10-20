import { useEffect, useMemo, useState } from 'react'

const refreshRate = 1000

export default function useCountdown(date: Date): {
  diff: number
  d: number
  h: number
  m: number
  s: number
} {
  const [diff, setDiff] = useState(+new Date(date) - +new Date())
  const d = useMemo(() => Math.floor(diff / (1000 * 60 * 60 * 24)), [diff])
  const h = useMemo(() => Math.floor((diff / (1000 * 60 * 60)) % 24), [diff])
  const m = useMemo(() => Math.floor((diff / 1000 / 60) % 60), [diff])
  const s = useMemo(() => Math.floor((diff / 1000) % 60), [diff])

  useEffect(() => {
    const timer = setInterval(() => {
      const newDiff = +new Date(date) - +new Date()
      setDiff(newDiff <= 0 ? 0 : newDiff)
    }, refreshRate)
    return () => clearInterval(timer)
  }, [date])

  return { diff, d, h, m, s }
}
