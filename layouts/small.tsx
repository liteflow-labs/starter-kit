import { Box } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'

const SmallLayout: FC<PropsWithChildren> = ({ children, ...props }) => (
  <Box
    as="main"
    mx="auto"
    maxW="3xl"
    py={{ base: 8, lg: 12 }}
    px={{ base: 6, lg: 8 }}
    pb={10}
    {...props}
  >
    {children}
  </Box>
)
export default SmallLayout
