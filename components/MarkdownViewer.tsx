import {
  Box,
  Link,
  OrderedList,
  SkeletonText,
  Text,
  UnorderedList,
  chakra,
  useColorMode,
} from '@chakra-ui/react'
import { MarkdownPreviewProps } from '@uiw/react-markdown-preview'
import useTranslation from 'next-translate/useTranslation'
import dynamic from 'next/dynamic'
import { FC, useEffect, useRef, useState } from 'react'

const MDPreview = dynamic<MarkdownPreviewProps>(
  () => import('@uiw/react-markdown-preview'),
  {
    ssr: false,
    // SkeletonText placeholder while loading
    loading: () => <SkeletonText noOfLines={2} />,
  },
)

const MarkdownViewer: FC<MarkdownPreviewProps> = ({ source, ...props }) => {
  const { t } = useTranslation('components')
  const { colorMode } = useColorMode()
  const [isMultiline, setMultiline] = useState(false)
  const [isOpen, setOpen] = useState(false)
  const invisibleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = invisibleRef.current
    const ONE_LINE_HEIGHT = 24
    if (
      // hack to check if the text is multiline by using hidden div
      (element && element.scrollHeight > ONE_LINE_HEIGHT) ||
      // check if the text is multiline by checking for newlines
      (source && source.split(/\r\n|\r|\n/).length > 1)
    ) {
      setMultiline(true)
    }
  }, [source])

  return (
    <Box position="relative">
      <chakra.div
        ref={invisibleRef}
        position="absolute"
        w="full"
        visibility="hidden"
      >
        {source}
      </chakra.div>
      <div data-color-mode={colorMode}>
        <MDPreview
          components={{
            p: (props) => <Text {...props} />,
            br: () => <br />,
            ol: (props) => <OrderedList {...props} />,
            ul: (props) => <UnorderedList {...props} />,
            a: (props) => (
              <Link
                color="brand.500"
                _hover={{ textDecoration: 'underline' }}
                {...props}
              />
            ),
            // Force these to be text components
            h1: (props) => <Text {...props} />,
            h2: (props) => <Text {...props} />,
            h3: (props) => <Text {...props} />,
            h4: (props) => <Text {...props} />,
            h5: (props) => <Text {...props} />,
            h6: (props) => <Text {...props} />,
            code: (props) => <Text {...(props as any)} />, // TODO: fix this type
            hr: () => <></>,
          }}
          style={{
            display: 'flex',
            height: isOpen ? 'auto' : '24px',
            overflow: isOpen ? 'visible' : 'hidden',
          }}
          source={source}
          {...props}
        />
      </div>
      {isMultiline && (
        <chakra.button
          onClick={() => setOpen(!isOpen)}
          color="brand.500"
          _active={{ opacity: 0.6 }}
          _hover={{ bg: 'transparent', opacity: 0.8 }}
        >
          <Text variant="button2">
            {isOpen ? t('truncate.show-less') : t('truncate.show-more')}
          </Text>
        </chakra.button>
      )}
    </Box>
  )
}

export default MarkdownViewer
