import { Flex, Heading, Icon, Stack } from '@chakra-ui/react'
import { FaExclamation } from '@react-icons/all-files/fa/FaExclamation'
import { FC } from 'react'

const CartErrorStep: FC = () => {
  return (
    <Stack height="full" align="center" justify="center" spacing={4}>
      <Flex
        as="span"
        bgColor="red.50"
        h={12}
        w={12}
        align="center"
        justify="center"
        rounded="full"
      >
        {<Icon as={FaExclamation} w={8} h={8} color="red.400" />}
      </Flex>
      <Stack spacing={1} textAlign="center">
        <Heading as="h3" variant="heading1" color="brand.black">
          Error
        </Heading>
        <Heading as="h5" variant="heading3" color="gray.500">
          There was an error with your transaction
        </Heading>
      </Stack>
    </Stack>
  )
}

export default CartErrorStep
