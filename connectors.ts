import { MagicConnectConnector } from '@everipedia/wagmi-magic-connector'
import invariant from 'ts-invariant'
import {
  Chain,
  configureChains,
  Connector,
  createClient,
  goerli,
  mainnet,
} from 'wagmi'
import { bsc, bscTestnet, polygon, polygonMumbai } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'
import { theme } from './styles/theme'

export const { chains, provider } = configureChains(
  [mainnet, goerli, bscTestnet, bsc, polygon, polygonMumbai],
  [publicProvider()],
)

const email = (chainId: number) => {
  invariant(environment.MAGIC_API_KEY, 'missing MAGIC_API_KEY')
  const chain: Chain | undefined = chains.find((chain) => chain.id === chainId)
  invariant(chain, `chain with id ${chainId} not found`)
  const rpcUrl = chain.rpcUrls.default.http[0]
  invariant(rpcUrl, `no rpcUrl found for chain ${chainId}`)
  return new MagicConnectConnector({
    options: {
      apiKey: environment.MAGIC_API_KEY,
      accentColor: theme.colors.brand[500],
      customHeaderText: 'Acme',
      magicSdkConfiguration: {
        network: {
          rpcUrl,
          chainId,
        },
      },
    },
  }) as unknown as Connector
}

export const connectors: {
  injected?: InjectedConnector
  walletConnect?: WalletConnectConnector
  coinbase?: CoinbaseWalletConnector
  email?: Connector
} = {
  email: environment.MAGIC_API_KEY ? email(environment.CHAIN_ID) : undefined,
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
