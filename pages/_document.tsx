// eslint-disable-next-line @next/next/no-document-import-in-page
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

import { getDataFromTree } from '@apollo/client/react/ssr'
import getClient from '../apollo'
import { COOKIE_JWT_TOKEN } from '../session'

class MyDocument extends Document {
  constructor(props: DocumentProps) {
    super(props)

    const { __NEXT_DATA__, apolloState } = props
    __NEXT_DATA__.apolloState = apolloState
  }

  static async getInitialProps(
    context: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const apolloClient = getClient(context.req.cookies[COOKIE_JWT_TOKEN], true)
    await getDataFromTree(<context.AppTree pageProps={{}} />) // TOFIX: Need to somehow pass the page props here
    const initialProps = await Document.getInitialProps(context)
    return {
      ...initialProps,
      apolloState: apolloClient.extract(),
    }
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
}

export default MyDocument
