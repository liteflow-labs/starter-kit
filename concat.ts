import { OperationVariables } from '@apollo/client'

export function concatToQuery<T = any>(
  key: Exclude<keyof T, '__typename'>,
): (
  previousQueryResult: any,
  options: { fetchMoreResult?: any; variables?: OperationVariables },
) => any {
  return (previousQueryResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) return previousQueryResult
    return {
      ...fetchMoreResult,
      [key]: {
        ...fetchMoreResult[key],
        nodes: [
          ...(previousQueryResult[key].nodes || []),
          ...(fetchMoreResult[key].nodes || []),
        ],
      },
    }
  }
}
