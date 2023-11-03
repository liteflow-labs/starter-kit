import { Flex, Heading, Icon, Stack } from '@chakra-ui/react'
import { FaCheck } from '@react-icons/all-files/fa/FaCheck'
import { FC } from 'react'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import Link from '../../Link/Link'

type Props = {
  chainId: number
  transactionHash: string
}

const CartSuccessStep: FC<Props> = ({ chainId, transactionHash }) => {
  const blockExplorer = useBlockExplorer(chainId)
  return (
    <Stack height="full" align="center" justify="center" spacing={4}>
      <Flex
        as="span"
        bgColor="green.50"
        h={12}
        w={12}
        align="center"
        justify="center"
        rounded="full"
      >
        {<Icon as={FaCheck} w={8} h={8} color="green.400" />}
      </Flex>
      <Stack spacing={1} textAlign="center">
        <Heading as="h3" variant="heading1" color="brand.black">
          Congratulations
        </Heading>
        <Heading as="h5" variant="heading3" color="gray.500">
          Your transaction was successful
        </Heading>
        <Link
          href={blockExplorer.transaction(transactionHash) || ''}
          isExternal
          _hover={{
            textDecoration: 'underline',
          }}
        >
          View transaction
        </Link>
      </Stack>
    </Stack>
  )
}

export default CartSuccessStep
