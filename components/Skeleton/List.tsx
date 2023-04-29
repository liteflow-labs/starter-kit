import { FC, Fragment } from 'react'
import List, { ListProps } from '../List/List'

type Props = ListProps & {
  items: number
}

const SkeletonList: FC<Props> = ({ items, children, ...props }) => {
  return (
    <List {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <Fragment key={i}>{children}</Fragment>
      ))}
    </List>
  )
}

export default SkeletonList
