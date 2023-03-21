import { EmailConnector } from '@nft/email-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import environment from './environment'

const connectors = {
  email: undefined as EmailConnector | undefined,
  injected: new InjectedConnector({
    supportedChainIds: [environment.CHAIN_ID],
  }),
  walletConnect: new WalletConnectConnector({
    rpc: {
      [environment.CHAIN_ID]: environment.PUBLIC_ETHEREUM_PROVIDER,
    },
    supportedChainIds: [environment.CHAIN_ID],
    chainId: environment.CHAIN_ID,
  }),
  coinbase: new WalletLinkConnector({
    supportedChainIds: [environment.CHAIN_ID],
    appName: 'Black Market',
    url: 'https://demo.liteflow.com',
  }),
}

if (environment.MAGIC_API_KEY.length > 0) {
  connectors.email = new EmailConnector({
    apiKey: environment.MAGIC_API_KEY,
    options: {
      network: {
        rpcUrl: environment.PUBLIC_ETHEREUM_PROVIDER,
        chainId: environment.CHAIN_ID,
      },
    },
  })
}

export default connectors
