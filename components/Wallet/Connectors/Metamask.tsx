import { AbstractConnector } from '@web3-react/abstract-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import React, { VFC } from 'react'
import WalletBase from './_base'

type Props = {
  connector: InjectedConnector
  onError: (error?: Error) => void
  activate: (
    connector: AbstractConnector,
    onError?: ((error: Error) => void) | undefined,
    throwErrors?: boolean | undefined,
  ) => Promise<void>
}

export const IconMetamask = (
  <svg viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M31.4062 1.16699L18.9199 10.4407L21.2289 4.96935L31.4062 1.16699Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.58105 1.16699L14.9669 10.5286L12.7709 4.96935L2.58105 1.16699Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.9136 22.6635L23.5881 27.7584L30.7034 29.716L32.7489 22.7764L26.9136 22.6635Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.26343 22.7764L3.29637 29.716L10.4117 27.7584L7.08617 22.6635L1.26343 22.7764Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0101 14.0549L8.02734 17.0541L15.0924 17.3678L14.8415 9.77563L10.0101 14.0549Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.9772 14.0548L19.0831 9.68774L18.9199 17.3677L25.9725 17.054L23.9772 14.0548Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.4116 27.7583L14.6532 25.6877L10.9889 22.8265L10.4116 27.7583Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.334 25.6877L23.5881 27.7583L22.9983 22.8265L19.334 25.6877Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.5883 27.7583L19.3342 25.6877L19.6731 28.4611L19.6354 29.6281L23.5883 27.7583Z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.4119 27.7583L14.3648 29.6281L14.3397 28.4611L14.6534 25.6877L10.4119 27.7583Z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.4275 20.9944L10.8887 19.9529L13.3859 18.8109L14.4275 20.9944Z"
      fill="#233447"
      stroke="#233447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5601 20.9944L20.6016 18.8109L23.1114 19.9529L19.5601 20.9944Z"
      fill="#233447"
      stroke="#233447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.4117 27.7584L11.014 22.6635L7.08618 22.7764L10.4117 27.7584Z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.9858 22.6635L23.5882 27.7584L26.9137 22.7764L22.9858 22.6635Z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25.9725 17.0541L18.9199 17.3678L19.5725 20.9945L20.614 18.8109L23.1238 19.9529L25.9725 17.0541Z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.8885 19.9529L13.3983 18.8109L14.4273 20.9945L15.0924 17.3678L8.02734 17.0541L10.8885 19.9529Z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.02734 17.0541L10.9889 22.8266L10.8885 19.9529L8.02734 17.0541Z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.1238 19.9529L22.9983 22.8266L25.9724 17.0541L23.1238 19.9529Z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.0923 17.3678L14.4272 20.9945L15.2555 25.2737L15.4437 19.6392L15.0923 17.3678Z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.9199 17.3678L18.5811 19.6266L18.7316 25.2737L19.5724 20.9945L18.9199 17.3678Z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5725 20.9944L18.7317 25.2737L19.334 25.6878L22.9984 22.8266L23.1238 19.9529L19.5725 20.9944Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.8887 19.9529L10.9891 22.8266L14.6534 25.6878L15.2557 25.2737L14.4275 20.9944L10.8887 19.9529Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.6354 29.6282L19.673 28.4612L19.3593 28.1851H14.6283L14.3397 28.4612L14.3648 29.6282L10.4119 27.7584L11.7923 28.8878L14.5907 30.8329H19.397L22.2079 28.8878L23.5883 27.7584L19.6354 29.6282Z"
      fill="#C0AD9E"
      stroke="#C0AD9E"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.3341 25.6878L18.7318 25.2737H15.2557L14.6533 25.6878L14.3396 28.4611L14.6282 28.1851H19.3592L19.6729 28.4611L19.3341 25.6878Z"
      fill="#161616"
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M31.9334 11.0431L33.0001 5.92307L31.4064 1.16699L19.3342 10.127L23.9774 14.0548L30.5405 15.9748L31.9962 14.2807L31.3687 13.829L32.3727 12.9129L31.5946 12.3105L32.5985 11.545L31.9334 11.0431Z"
      fill="#763D16"
      stroke="#763D16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 5.92307L2.06667 11.0431L1.38902 11.545L2.39294 12.3105L1.62745 12.9129L2.63137 13.829L2.00392 14.2807L3.44706 15.9748L10.0102 14.0548L14.6533 10.127L2.58118 1.16699L1 5.92307Z"
      fill="#763D16"
      stroke="#763D16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M30.5405 15.9748L23.9774 14.0548L25.9727 17.054L22.9985 22.8266L26.9138 22.7764H32.7491L30.5405 15.9748Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0101 14.0548L3.44696 15.9748L1.26343 22.7764H7.08617L10.9889 22.8266L8.02735 17.054L10.0101 14.0548Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.92 17.3678L19.3341 10.127L21.2416 4.96936H12.771L14.6534 10.127L15.0926 17.3678L15.2432 19.6517L15.2557 25.2737H18.7318L18.7569 19.6517L18.92 17.3678Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const WalletMetamask: VFC<Props> = ({ connector, onError, activate }) => {
  return (
    <WalletBase
      connector={connector}
      icon={IconMetamask}
      onError={onError}
      activate={activate}
      name="Metamask"
    />
  )
}
export default WalletMetamask
