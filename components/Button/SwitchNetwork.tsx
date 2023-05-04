import { Button, ButtonProps, useToast } from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import { PropsWithChildren, useCallback } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

const ButtonWithNetworkSwitch = ({
  children,
  chainId,
  ...props
}: PropsWithChildren<
  ButtonProps & {
    chainId: number
  }
>): JSX.Element => {
  const { chain } = useNetwork()
  const { switchNetwork, isLoading } = useSwitchNetwork({
    chainId,
    throwForSwitchChainNotSupported: true,
    onError(error) {
      toast({
        title: formatError(error),
        status: 'error',
      })
    },
  })
  const toast = useToast()

  const handleSwitchNetwork = useCallback(() => {
    if (!switchNetwork) return
    switchNetwork()
  }, [switchNetwork])

  if (chain && chain.id !== chainId)
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
