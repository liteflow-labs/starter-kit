import { Box, Spinner, Text } from '@chakra-ui/react'
import { VFC } from 'react'
import { useConnect } from 'wagmi'
import { Connector } from 'wagmi/connectors'

type Props = {
  connector: Connector
  name: string
  icon: JSX.Element
  onError: (error?: Error) => void
}

const WalletBase: VFC<Props> = ({ icon, connector, onError, name }) => {
  const { connect, isLoading } = useConnect({
    onError,
    connector,
  })

  return (
    <Box as="a" p={6} onClick={() => connect()}>
      {isLoading ? (
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
