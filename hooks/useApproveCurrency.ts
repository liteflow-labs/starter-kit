import { BigNumberish } from '@ethersproject/bignumber'
import { erc20ABI, useAccount, useContractWrite, useMutation } from 'wagmi'
import { readContract } from 'wagmi/actions'

export default function useApproveCurrency(
  currency: {
    chainId: number
    address: string | null
    decimals: number
  },
  spender: `0x${string}`,
) {
  const { address } = useAccount()
  const approve = useContractWrite({
    abi: erc20ABI,
    chainId: currency.chainId,
    address: currency.address as `0x${string}`,
    functionName: 'approve',
  })
  return useMutation({
    mutationFn: async (amount: BigNumberish) => {
      if (!currency.address) return
      const allowance = await readContract({
        chainId: currency.chainId,
        address: currency.address as `0x${string}`,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [
          address as `0x${string}`, // owner
          spender, // spender
        ],
      })
      if (allowance > BigInt(amount.toString())) return
      return approve.writeAsync({
        args: [spender, BigInt(amount.toString())],
      })
    },
  })
}
