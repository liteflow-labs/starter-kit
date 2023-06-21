import { getAddress, isAddress } from '@ethersproject/address'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(duration)

export const isSameAddress = (addressA: string, addressB: string): boolean => {
  return addressA.toLowerCase() === addressB.toLowerCase()
}

export const formatAddress = (
  address: string | undefined,
  length = 10,
): string => {
  if (!address) return ''
  if (!isAddress(address)) return ''
  const parsed = getAddress(address)
  const chars = (length - 2) / 2
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export const dateFromNow = (date: Date | string): string => {
  return dayjs(date).fromNow()
}

export const formatDate = (date: Date | string): string => {
  return dayjs(date).utc().format('DD/MM/YYYY, HH[:]mm UTC')
}

/**
  Valid format for inputs min and max
  Input doesn't accept other formats for datetime-local 
**/
export const formatDateDatetime = (date: Date | string): string => {
  return dayjs(date).utc(true).format('YYYY-MM-DD[T]HH[:]mm')
}

export const getHumanizedDate = (second: number): string => {
  return dayjs.duration(second, 'seconds').humanize()
}

export const formatError = (error: unknown): string | undefined => {
  if (!error) return
  if ((error as any).code === 'ACTION_REJECTED')
    return 'Transaction was cancelled'
  if ((error as any).error) return formatError((error as any).error)
  if ((error as any).data?.message) return formatError((error as any).data)
  if ((error as Error).message) return (error as Error).message
  return (error as any).toString()
}

export function removeEmptyFromObject<T = any>(obj: {
  [key: string]: undefined | null | T
}): {
  [key: string]: T
} {
  return Object.keys(obj).reduce((prev, key) => {
    if (obj[key] === undefined || obj[key] === null) {
      return prev
    }
    return {
      ...prev,
      [key]: obj[key],
    }
  }, {})
}
