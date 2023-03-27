// eslint-disable-next-line @next/next/no-document-import-in-page
import { NormalizedCacheObject } from '@apollo/client'
import { getDataFromTree } from '@apollo/client/react/ssr'
import Document, {
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import { ReactElement } from 'react'
import invariant from 'ts-invariant'
import getClient from '../client'

class MyDocument extends Document {
  constructor(props: DocumentProps) {
    super(props)

    const { __NEXT_DATA__, apolloState } = props as any // TODO: fix type
    __NEXT_DATA__.apolloState = apolloState
  }

  render(): ReactElement {
    return (
      <Html lang={this.props.locale || 'en'}>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }

  static async getInitialProps(
    context: DocumentContext,
  ): Promise<DocumentInitialProps & { apolloState: NormalizedCacheObject }> {
    invariant(context.req)
    const cookies = (context.req as any).cookies // TODO: fix type
    const jwt = cookies ? cookies['jwt-token'] : null
    // the `getClient` needs to be reset on every request as early as possible and before any rendering
    const apolloClient = getClient(jwt, true)
    // Generate the now time, rounded to the second to avoid re-rendering on the client
    // TOFIX: find a better way to share the time between the app and document
    const now = Math.floor(Date.now() / 1000) * 1000
    // This renders the page and wait for all requests to be resolved
    await getDataFromTree(<context.AppTree pageProps={{ jwt, now }} />) // TOFIX: Need to somehow pass the page props here
    // This `defaultGetInitialProps` should be as late as possible and after the data are resolved by `getDataFromTree`
    const initialProps = await context.defaultGetInitialProps(context)
    return {
      ...initialProps,
      apolloState: apolloClient.extract(),
    }
  }
}

export default MyDocument
