import { useContext } from 'react'
import invariant from 'ts-invariant'
import { EnvironmentContext } from '../environment'
import useQueryParamSingle from './useQueryParamSingle'

type PaginateQuery = {
  page: number
  limit: number
  offset: number
}

export default function usePaginateQuery({
  defaultLimit,
}: {
  defaultLimit?: number
} = {}): PaginateQuery {
  const { PAGINATION_LIMIT } = useContext(EnvironmentContext)
  const page = useQueryParamSingle('page', {
    defaultValue: 1,
    parse: (value) => (value ? parseInt(value, 10) : 1),
  })
  invariant(page, 'page is falsy')
  const limit = useQueryParamSingle('limit', {
    defaultValue: defaultLimit || PAGINATION_LIMIT,
    parse: (value) =>
      value ? parseInt(value, 10) : defaultLimit || PAGINATION_LIMIT,
  })
  invariant(limit, 'limit is falsy')
  const offset = (page - 1) * limit
  return {
    page,
    limit,
    offset,
  }
}
