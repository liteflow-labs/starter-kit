import {
  Code,
  Divider,
  Heading,
  OrderedList,
  Text,
  UnorderedList,
  useColorMode,
} from '@chakra-ui/react'
import { MarkdownPreviewProps } from '@uiw/react-markdown-preview'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import Link from './Link/Link'

const MDPreview = dynamic<MarkdownPreviewProps>(
  () => import('@uiw/react-markdown-preview'),
  {
    ssr: false,
  },
)

const MarkdownViewer: FC<MarkdownPreviewProps> = (props) => {
  const { colorMode } = useColorMode()
  return (
    <div data-color-mode={colorMode}>
      <MDPreview
        components={{
          p: ({ children }) => <Text>{children}</Text>,
          h1: ({ children }) => {
            const title = children.filter((child) => typeof child === 'string')
            return (
              <Heading as="h1" variant="title">
                {title}
              </Heading>
            )
          },
          h2: ({ children }) => {
            const title = children.filter((child) => typeof child === 'string')
            return (
              <Heading as="h2" variant="subtitle">
                {title}
              </Heading>
            )
          },
          h3: ({ children }) => {
            const title = children.filter((child) => typeof child === 'string')
            return (
              <Heading as="h3" variant="heading1">
                {title}
              </Heading>
            )
          },
          h4: ({ children }) => {
            const title = children.filter((child) => typeof child === 'string')
            return (
              <Heading as="h4" variant="heading2">
                {title}
              </Heading>
            )
          },
          h5: ({ children }) => {
            const title = children.filter((child) => typeof child === 'string')
            return (
              <Heading as="h5" variant="heading3">
                {title}
              </Heading>
            )
          },
          h6: ({ children }) => {
            const title = children.filter((child) => typeof child === 'string')
            return (
              <Heading as="h6" variant="heading4">
                {title}
              </Heading>
            )
          },
          br: () => <br />,
          hr: () => <Divider />,
          code: ({ children }) => <Code>{children}</Code>,
          ol: ({ children }) => <OrderedList>{children}</OrderedList>,
          ul: ({ children }) => <UnorderedList>{children}</UnorderedList>,
          a: ({ children, href }) => {
            if (!href) return null
            return (
              <Link href={href} isExternal>
                {children}
              </Link>
            )
          },
        }}
        {...props}
      />
    </div>
  )
}

export default MarkdownViewer
