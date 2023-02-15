import { Box, BoxProps, Spinner, Text } from '@chakra-ui/react'
import { SyntheticEvent, useMemo, useState, VFC } from 'react'
import { Connector, useAccount as useWagmiAccount, useConnect } from 'wagmi'
import useAccount from '../../../hooks/useAccount'

type Props = Omit<BoxProps, 'onError'> & {
  connector: Connector
  name: string
  icon: JSX.Element
  onActivate: (() => void) | undefined
  onError: (error: Error) => void
}

const WalletBase: VFC<Props> = ({
  icon,
  connector,
  name,
  onError,
  onActivate,
  ...props
}) => {
  const { isConnected, isLoggedIn } = useAccount()
  const { connector: connectedConnector } = useWagmiAccount()
  const { connectAsync } = useConnect()
  const [isLoading, setIsLoading] = useState(false)

  const handle = async (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsLoading(true)
    try {
      await connectAsync({ connector })
      onActivate && onActivate()
    } catch (e) {
      onError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const loading = useMemo(
    () =>
      isLoading ||
      (isConnected && !isLoggedIn && connectedConnector === connector),
    [isLoading, isConnected, isLoggedIn, connectedConnector, connector],
  )

  return (
    <Box as="a" p={6} onClick={handle} {...props}>
      {loading ? (
        <Spinner
          display="block"
          color="brand.500"
          h={8}
          w={8}
          thickness="2px"
          speed="0.65s"
        />
      ) : (
        <Box h={8} w={8}>
          {icon}
        </Box>
      )}
      <Text
        as="span"
        color="brand.black"
        fontSize="sm"
        fontWeight="semibold"
        lineHeight={5}
      >
        {name}
      </Text>
    </Box>
  )
}
export default WalletBase
