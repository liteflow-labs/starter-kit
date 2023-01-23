import { Text as BaseText, TextProps } from '@react-email/text'

type Props = TextProps & { secondary?: boolean }

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
}

const textSecondary = {
  ...text,
  color: '#ababab',
}

export default function Text({ secondary, ...props }: Props): JSX.Element {
  return <BaseText style={secondary ? textSecondary : text} {...props} />
}
