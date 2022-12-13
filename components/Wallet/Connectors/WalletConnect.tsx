import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import React, { VFC } from 'react'
import WalletBase from './_base'

type Props = {
  connector: WalletConnectConnector
  onError: (error?: Error) => void
  activate: (
    connector: AbstractConnector,
    onError?: ((error: Error) => void) | undefined,
    throwErrors?: boolean | undefined,
  ) => Promise<void>
}

export const IconWalletConnect = (
  <svg viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.88444 10.0256C12.103 4.91626 20.5638 4.91626 25.7823 10.0256L26.4104 10.6405C26.6713 10.896 26.6713 11.3102 26.4104 11.5657L24.2619 13.6692C24.1315 13.7969 23.92 13.7969 23.7895 13.6692L22.9252 12.823C19.2847 9.25857 13.3821 9.25857 9.74156 12.823L8.81599 13.7292C8.68553 13.8569 8.47401 13.8569 8.34354 13.7292L6.19509 11.6257C5.93416 11.3702 5.93416 10.956 6.19509 10.7006L6.88444 10.0256ZM30.2256 14.3759L32.1377 16.2481C32.3986 16.5035 32.3986 16.9177 32.1377 17.1732L23.5158 25.6149C23.2548 25.8704 22.8318 25.8704 22.5709 25.6149C22.5709 25.6149 22.5709 25.6149 22.5709 25.6149L16.4515 19.6236C16.3863 19.5597 16.2806 19.5597 16.2153 19.6236C16.2153 19.6236 16.2153 19.6236 16.2153 19.6236L10.0961 25.6149C9.83521 25.8704 9.41216 25.8704 9.15124 25.6149C9.15123 25.6149 9.15123 25.6149 9.15123 25.6149L0.529068 17.1731C0.268143 16.9176 0.268143 16.5034 0.529068 16.2479L2.4412 14.3758C2.70213 14.1203 3.12517 14.1203 3.3861 14.3758L9.5055 20.3672C9.57073 20.4311 9.67649 20.4311 9.74173 20.3672C9.74173 20.3672 9.74173 20.3672 9.74173 20.3672L15.8608 14.3758C16.1217 14.1203 16.5448 14.1203 16.8057 14.3758C16.8057 14.3758 16.8057 14.3758 16.8057 14.3758L22.9251 20.3672C22.9904 20.4311 23.0961 20.4311 23.1614 20.3672L29.2807 14.3759C29.5416 14.1205 29.9646 14.1205 30.2256 14.3759Z"
      fill="#3B99FC"
    />
  </svg>
)

const WalletWalletConnect: VFC<Props> = ({ connector, onError, activate }) => {
  return (
    <WalletBase
      connector={connector}
      icon={IconWalletConnect}
      onError={onError}
      name="WalletConnect"
      activate={activate}
    />
  )
}
export default WalletWalletConnect
