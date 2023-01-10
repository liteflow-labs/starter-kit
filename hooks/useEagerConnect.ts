import { useAccount } from 'wagmi'

export default function useEagerConnect(): boolean {
  const { isConnecting, isReconnecting } = useAccount()
  return !isConnecting && !isReconnecting
}
