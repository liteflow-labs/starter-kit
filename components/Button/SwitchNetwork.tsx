import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren, useCallback } from 'react'
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
  const { switchNetwork } = useSwitchNetwork()

  const handleSwitchNetwork = useCallback(() => {
    if (!switchNetwork) return
    switchNetwork()
  }, [switchNetwork])

  if (currentChainId !== chainId)
    return (
      <Button
        {...props}
        onClick={handleSwitchNetwork}
        type="button"
        leftIcon={undefined}
        rightIcon={undefined}
      >
        Switch Network
      </Button>
    )

  return <Button {...props}>{children}</Button>
}
export default ButtonWithNetworkSwitch
