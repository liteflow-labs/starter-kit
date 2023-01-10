import { configureChains, Connector, createClient } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'

const { provider } = configureChains([bscTestnet], [publicProvider()])

export const connectors: {
  injected?: InjectedConnector
  walletConnect?: WalletConnectConnector
  coinbase?: CoinbaseWalletConnector
  email?: Connector
} = {
  // Issue with the library
  // https://github.com/EveripediaNetwork/wagmi-magic-connector/issues/38
  // email: new MagicAuthConnector({
  //   options: {
  //     apiKey: environment.MAGIC_API_KEY,
  //   },
  // }),
  injected: new InjectedConnector({}),
  walletConnect: new WalletConnectConnector({
    options: { version: '1' },
  }),
  coinbase: new CoinbaseWalletConnector({
    options: { appName: 'Acme' },
  }),
}

export const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    connectors.email,
    connectors.injected,
    connectors.coinbase,
    connectors.walletConnect,
  ].filter(Boolean),
})
