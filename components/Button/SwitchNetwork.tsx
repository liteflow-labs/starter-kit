import { Button, ButtonProps, useToast } from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import useTranslation from 'next-translate/useTranslation'
import { PropsWithChildren, useCallback } from 'react'
import {
  useAccount as useWagmiAccount,
  useNetwork,
  useSwitchNetwork,
} from 'wagmi'
import useAccount from '../../hooks/useAccount'

const ButtonWithNetworkSwitch = ({
  children,
  chainId,
  ...props
}: PropsWithChildren<
  ButtonProps & {
    chainId: number
  }
>): JSX.Element => {
  const { isLoading, leftIcon, rightIcon, type, ...restProps } = props
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
        {t('navbar.sign-in')}
      </Button>
    )

  if (address && !isLoggedIn)
    return (
      <Button {...restProps} isLoading loadingText={t('navbar.signing-in')} />
    )

  if (chain && chain.id !== chainId)
    return (
      <Button
        {...restProps}
        isLoading={networkIsLoading}
        onClick={handleSwitchNetwork}
      >
        Switch Network
      </Button>
    )

  return <Button {...props}>{children}</Button>
}
export default ButtonWithNetworkSwitch
