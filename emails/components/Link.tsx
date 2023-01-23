import { Link as LinkBase, LinkProps } from '@react-email/link'

type Props = LinkProps & { secondary?: boolean }

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
}

const linkSecondary = {
  ...link,
  color: '#898989',
}

export default function Link({ secondary, ...props }: Props): JSX.Element {
  return <LinkBase style={secondary ? linkSecondary : link} {...props} />
}
