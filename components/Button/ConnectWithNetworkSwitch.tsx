import { Button, ButtonProps, useToast } from '@chakra-ui/react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import useTranslation from 'next-translate/useTranslation'
import { JSX, PropsWithChildren, useCallback } from 'react'
import {
  useNetwork,
  useSwitchNetwork,
  useAccount as useWagmiAccount,
} from 'wagmi'
import useAccount from '../../hooks/useAccount'
import { formatError } from '../../utils'

const ConnectButtonWithNetworkSwitch = ({
  children,
  chainId,
  ...props
}: PropsWithChildren<
  ButtonProps & {
    chainId?: number
  }
>): JSX.Element => {
  const { isDisabled, isLoading, leftIcon, rightIcon, type, ...restProps } =
    props
  const { t } = useTranslation('components')
  const { chain } = useNetwork()
  const { address } = useWagmiAccount()
  const { isLoggedIn } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { switchNetwork, isLoading: networkIsLoading } = useSwitchNetwork({
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

  if (!address)
    return (
      <Button {...restProps} onClick={openConnectModal}>
        {t('network.button.sign-in')}
      </Button>
    )

  if (address && !isLoggedIn)
    return (
      <Button
        {...restProps}
        isLoading
        loadingText={t('network.button.signing-in')}
      />
    )

  if (chain && chainId && chain.id !== chainId)
    return (
      <Button
        {...restProps}
        isLoading={networkIsLoading}
        onClick={handleSwitchNetwork}
      >
        {t('network.button.switch-network')}
      </Button>
    )

  return <Button {...props}>{children}</Button>
}
export default ConnectButtonWithNetworkSwitch
