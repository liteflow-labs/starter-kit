import { GetServerSidePropsContext } from 'next'

export const getLimit = (
  ctx: GetServerSidePropsContext,
  defaultLimit: number,
): number =>
  ctx.query.limit
    ? Array.isArray(ctx.query.limit)
      ? parseInt(ctx.query.limit[0], 10)
      : parseInt(ctx.query.limit, 10)
    : defaultLimit

export const getPage = (ctx: GetServerSidePropsContext): number =>
  ctx.query.page
    ? Array.isArray(ctx.query.page)
      ? parseInt(ctx.query.page[0], 10)
      : parseInt(ctx.query.page, 10)
    : 1

export const getOrder = <T>(
  ctx: GetServerSidePropsContext,
  defaultOrder: T,
): T =>
  Array.isArray(ctx.query.orderBy)
    ? (ctx.query.orderBy[0] as unknown as T)
    : (ctx.query.orderBy as unknown as T) || defaultOrder

export const getOffset = (
  ctx: GetServerSidePropsContext,
  defaultLimit: number,
): number => {
  const page = getPage(ctx)
  const limit = getLimit(ctx, defaultLimit)
  return (page - 1) * limit
}
