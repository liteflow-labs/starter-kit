import { Button, ButtonProps, useToast } from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import { useChainId, useSwitchNetwork } from 'wagmi'

const ButtonWithNetworkSwitch = ({
  children,
  chainId,
  ...props
}: PropsWithChildren<
  ButtonProps & {
    chainId: number
  }
>): JSX.Element => {
  const currentChainId = useChainId()
  const { switchNetwork, isLoading, error } = useSwitchNetwork({
    throwForSwitchChainNotSupported: true,
  })
  const toast = useToast()

  const handleSwitchNetwork = useCallback(() => {
    if (!switchNetwork) return
    switchNetwork(chainId)
  }, [chainId, switchNetwork])

  useEffect(() => {
    if (error)
      toast({
        title: formatError(error),
        status: 'error',
      })
  }, [error, toast])

  if (currentChainId !== chainId)
    return (
      <Button
        {...props}
        onClick={handleSwitchNetwork}
        type="button"
        leftIcon={undefined}
        rightIcon={undefined}
        isLoading={isLoading}
      >
        Switch Network
      </Button>
    )

  return <Button {...props}>{children}</Button>
}
export default ButtonWithNetworkSwitch
