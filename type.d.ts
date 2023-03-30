interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
    autoRefreshOnNetworkChange?: boolean
  }
  web3?: Record<string, unknown>
}

declare module '@pinata/ipfs-gateway-tools/dist/node' {
  export default class IPFSGatewayTools {
    constructor()

    containsCID(url: string): { containsCid: boolean; cid: string | null }
    convertToDesiredGateway(
      sourceUrl: string,
      desiredGatewayPrefix: string,
    ): string
  }
}

type UUID = string
type URI = string

type Falsy = false | 0 | '' | null | undefined
interface Array<T> {
  // Ensure mapping like `array.filter(Boolean)` actually return a type with no falsy value
  filter<S extends T>(
    predicate: BooleanConstructor,
    thisArg?: any,
  ): Exclude<S, Falsy>[]
}
