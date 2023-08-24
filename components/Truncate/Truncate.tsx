import { chakra, Text, TextProps } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { JSX, useMemo, useState } from 'react'
import linkify from '../Linkify/Linkify'

type Props = {
  children: string
  length?: number
  size?: 'lg'
  color?: TextProps['color']
}

export default function Truncate({
  children,
  length = 90,
  size,
  color = 'gray.500',
}: Props): JSX.Element {
  const { t } = useTranslation('components')
  const [isOpen, setIsOpen] = useState(false)
  const truncate = useMemo(
    () =>
      children.length > length
        ? children.substring(0, length - 3) + '...'
        : linkify(children),
    [children, length],
  )
  return (
    <>
      <Text
        variant={size === 'lg' ? 'text' : 'text-sm'}
        color={color}
        whiteSpace="pre-wrap"
      >
        {isOpen ? linkify(children) : truncate}
        {children.length > length && !isOpen && (
          <chakra.button
            onClick={() => setIsOpen(true)}
            _active={{ opacity: 0.6 }}
            _hover={{ opacity: 0.8 }}
            ml={1}
          >
            <Text
              variant={size === 'lg' ? 'button1' : 'button2'}
              color="brand.black"
            >
              {t('truncate.show-more')}
            </Text>
          </chakra.button>
        )}
      </Text>
    </>
  )
}
