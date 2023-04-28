import { FC, Fragment } from 'react'
import List from '../List/List'

type Props = {
  items: number
}

const SkeletonList: FC<Props> = ({ items, children }) => {
  return (
    <List>
      {Array.from({ length: items }).map((_, i) => (
        <Fragment key={i}>{children}</Fragment>
      ))}
    </List>
  )
}

export default SkeletonList
