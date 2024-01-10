import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import numbro from 'numbro'
import { FC, HTMLAttributes, useMemo } from 'react'

export const formatPrice = (
  amount: BigNumberish,
  currency: { decimals: number; symbol: string },
  averageFrom?: number,
) => {
  const averageIsBiggerThanValue =
    !!averageFrom &&
    BigNumber.from(amount).gte(
      BigNumber.from(averageFrom).mul(
        BigNumber.from(10).pow(currency.decimals),
      ),
    )

  const value = numbro(formatUnits(amount, currency.decimals)).format({
    thousandSeparated: true,
    trimMantissa: true,
    mantissa: !averageIsBiggerThanValue ? currency.decimals : 4,
    average: averageIsBiggerThanValue,
  })
  return `${value} ${currency.symbol}`
}

const Price: FC<
  HTMLAttributes<any> & {
    amount: BigNumberish
    currency: {
      decimals: number
      symbol: string
    }
    averageFrom?: number
  }
> = ({ amount, currency, averageFrom, ...props }) => {
  const priceFormatted = useMemo(
    () => formatPrice(amount, currency, averageFrom),
    [amount, currency, averageFrom],
  )

  return <span {...props}>{priceFormatted}</span>
}

export default Price
