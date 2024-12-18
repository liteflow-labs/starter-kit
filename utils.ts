import { getAddress, isAddress } from '@ethersproject/address'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { BaseError } from 'viem'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(isBetween)

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

export const dateTooLong = (
  date: Date | string | undefined | null,
): boolean => {
  if (!date) return true
  return dayjs(date).diff(dayjs(), 'years') > 50
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

export const dateIsBefore = (now: Date, startDate: Date): boolean => {
  return dayjs(now).isBefore(dayjs(startDate))
}

export const dateIsBetween = (
  now: Date,
  startDate: Date,
  endDate: Date,
): boolean => {
  return dayjs(now).isBetween(dayjs(startDate), dayjs(endDate))
}

export function formatError(error: unknown): string | undefined {
  if (!error) return

  if (typeof error === 'string') return error
  if (
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'ACTION_REJECTED'
  )
    return 'Transaction was cancelled'
  if (error instanceof BaseError) return error.shortMessage
  if (typeof error === 'object' && 'error' in error)
    return formatError(error.error)
  if (typeof error === 'object' && 'data' in error)
    return formatError(error.data)
  if (typeof error === 'object' && 'message' in error)
    return formatError(error.message)
  if ((error as any).response?.errors?.length >= 0)
    return formatError((error as any).response.errors[0])
  if (error instanceof Error) return error.message

  return 'An unknown error occurred'
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
