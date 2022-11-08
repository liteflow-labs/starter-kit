import { EmailConnector } from '@nft/email-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import environment from './environment'

export const email = new EmailConnector({
  apiKey: environment.MAGIC_API_KEY,
  options: {
    network: {
      rpcUrl: environment.PUBLIC_ETHEREUM_PROVIDER,
      chainId: environment.CHAIN_ID,
    },
  },
})

export const injected = new InjectedConnector({
  supportedChainIds: [environment.CHAIN_ID],
})

export const walletConnect = new WalletConnectConnector({
  rpc: {
    [environment.CHAIN_ID]: environment.PUBLIC_ETHEREUM_PROVIDER,
  },
  supportedChainIds: [environment.CHAIN_ID],
  chainId: environment.CHAIN_ID,
})

export const coinbase = new WalletLinkConnector({
  supportedChainIds: [environment.CHAIN_ID],
  appName: 'Acme',
  url: 'https://demo.liteflow.com',
})

export const connectors = {
  email,
  injected,
  walletConnect,
  coinbase,
}
