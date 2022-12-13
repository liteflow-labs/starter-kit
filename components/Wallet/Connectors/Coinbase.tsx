import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import React, { VFC } from 'react'
import WalletBase from './_base'

type Props = {
  connector: WalletLinkConnector
  onError: (error?: Error) => void
  activate: (
    connector: AbstractConnector,
    onError?: ((error: Error) => void) | undefined,
    throwErrors?: boolean | undefined,
  ) => Promise<void>
}

export const IconCoinbase = (
  <svg viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.6666 32C25.5032 32 32.6666 24.8366 32.6666 16C32.6666 7.16345 25.5032 0 16.6666 0C7.83007 0 0.666626 7.16345 0.666626 16C0.666626 24.8366 7.83007 32 16.6666 32Z"
      fill="#2356E7"
    />
    <path
      d="M22.1852 17.0435C21.6964 19.6336 19.4237 21.5922 16.6918 21.5922C13.603 21.5922 11.0997 19.0888 11.0997 16C11.0997 12.9111 13.603 10.4078 16.6918 10.4078C19.4237 10.4078 21.6964 12.3674 22.1852 14.9564H27.8279C27.3018 9.26866 22.5169 4.81555 16.6918 4.81555C10.5142 4.81555 5.50745 9.82338 5.50745 16C5.50745 22.1776 10.5153 27.1844 16.6918 27.1844C22.5169 27.1844 27.3018 22.7312 27.8279 17.0435H22.1852Z"
      fill="white"
    />
  </svg>
)

const WalletCoinbase: VFC<Props> = ({ connector, onError, activate }) => {
  return (
    <WalletBase
      connector={connector}
      icon={IconCoinbase}
      onError={onError}
      name="Coinbase"
      activate={activate}
    />
  )
}
export default WalletCoinbase
