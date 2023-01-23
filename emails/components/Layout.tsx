import { Container } from '@react-email/container'
import { Head } from '@react-email/head'
import { Hr } from '@react-email/hr'
import { Html } from '@react-email/html'
import { Img } from '@react-email/img'
import { Preview } from '@react-email/preview'
import { Section } from '@react-email/section'
import { PropsWithChildren } from 'react'
import Link from './Link'
import Text from './Text'

type Props = PropsWithChildren<{
  preview?: string
}>

const main = {
  backgroundColor: '#ffffff',
}

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
}

const footer = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
}

export default function Layout({ preview, children }: Props): JSX.Element {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Section style={main}>
        <Container style={container}>
          {children}
          <Hr style={hr} />
          <Img src="/logo.svg" height="32" alt="Logo" />
          <Text style={footer}>
            <Link href="https://liteflow.com" target="_blank" secondary>
              Liteflow
            </Link>
            , NFT infrastructure simplified
          </Text>
        </Container>
      </Section>
    </Html>
  )
}
