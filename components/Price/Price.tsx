import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import numbro from 'numbro'
import { FC, HTMLAttributes, useMemo } from 'react'

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
  const amountFormatted = useMemo(() => {
    const averageIsBiggerThanValue =
      !!averageFrom &&
      BigNumber.from(amount).gte(
        BigNumber.from(averageFrom).mul(
          BigNumber.from(10).pow(currency.decimals),
        ),
      )

    return numbro(formatUnits(amount, currency.decimals)).format({
      thousandSeparated: true,
      trimMantissa: true,
      mantissa: !averageIsBiggerThanValue ? currency.decimals : 4,
      average: averageIsBiggerThanValue,
    })
  }, [amount, currency, averageFrom])

  return (
    <span {...props}>
      {amountFormatted} {currency.symbol}
    </span>
  )
}

export default Price
