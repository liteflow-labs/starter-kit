import { Box, Spinner, Text } from '@chakra-ui/react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import React, { SyntheticEvent, useState, VFC } from 'react'

type Props = {
  connector: AbstractConnector
  name: string
  icon: JSX.Element
  activate: (
    connector: AbstractConnector,
    onError?: ((error: Error) => void) | undefined,
    throwErrors?: boolean | undefined,
  ) => Promise<void>
  onError: (error?: Error) => void
}

const WalletBase: VFC<Props> = ({
  icon,
  connector,
  onError,
  name,
  activate,
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const handle = async (e: SyntheticEvent) => {
    setLoading(true)
    e.stopPropagation()
    e.preventDefault()
    onError() // reset error
    if (loading) return
    try {
      if (connector instanceof WalletConnectConnector) {
        // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
        // from issue https://github.com/NoahZinsmeister/web3-react/issues/124#issuecomment-993923827
        // let's remove this hack when issue is resolved
        connector.walletConnectProvider = undefined
      }
      await activate(connector, undefined, true)
    } catch (error) {
      onError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box as="a" p={6} onClick={handle}>
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
