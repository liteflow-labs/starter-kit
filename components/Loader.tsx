import { Center, Spinner } from '@chakra-ui/react'
import { FC, useMemo } from 'react'

type Props = {
  fullPage?: boolean
}

const Loader: FC<Props> = ({ fullPage }) => {
  const style = useMemo(
    /* Add a min height of 100 of the viewport minus the 64px for the navbar */
    () => (fullPage ? { minHeight: 'calc(100vh - 64px)' } : {}),
    [fullPage],
  )
  return (
    <Center p={4} {...style}>
      <Spinner size="lg" />
    </Center>
  )
}

export default Loader
