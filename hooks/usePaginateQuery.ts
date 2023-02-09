import invariant from 'ts-invariant'
import environment from '../environment'
import useQueryParamSingle from './useQueryParamSingle'

type PaginateQuery = {
  page: number
  limit: number
  offset: number
}

export default function usePaginateQuery({
  defaultLimit = environment.PAGINATION_LIMIT,
}: {
  defaultLimit?: number
} = {}): PaginateQuery {
  const page = useQueryParamSingle('page', {
    defaultValue: 1,
    parse: (value) => (value ? parseInt(value, 10) : 1),
  })
  invariant(page, 'page is falsy')
  const limit = useQueryParamSingle('limit', {
    defaultValue: defaultLimit,
    parse: (value) => (value ? parseInt(value, 10) : defaultLimit),
  })
  invariant(limit, 'limit is falsy')
  const offset = (page - 1) * limit
  return {
    page,
    limit,
    offset,
  }
}
