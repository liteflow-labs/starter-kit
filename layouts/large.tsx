import { Box } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'

const LargeLayout: FC<PropsWithChildren> = ({ children, ...props }) => (
  <Box
    as="main"
    mx="auto"
    maxW="7xl"
    py={{ base: 8, lg: 12 }}
    px={{ base: 6, lg: 8 }}
    pb={10}
    {...props}
  >
    {children}
  </Box>
)
export default LargeLayout
