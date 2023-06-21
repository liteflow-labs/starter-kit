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
  const { t } = useTranslation('components')
  const { chain } = useNetwork()
  const { address } = useWagmiAccount()
  const { isLoggedIn } = useAccount()
  const { openConnectModal } = useConnectModal()
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

  console.log(address, isLoggedIn)

  if (!address)
    return (
      <Button size={props.size} onClick={openConnectModal} colorScheme="brand">
        {t('navbar.sign-in')}
      </Button>
    )

  if (address && !isLoggedIn)
    return (
      <Button
        size={props.size}
        colorScheme="brand"
        isLoading
        loadingText={t('navbar.signing-in')}
      />
    )

  if (chain && chain.id !== chainId)
    return (
      <Button
        size={props.size}
        onClick={handleSwitchNetwork}
        isLoading={isLoading}
      >
        Switch Network
      </Button>
    )

  return <Button {...props}>{children}</Button>
}
export default ButtonWithNetworkSwitch
