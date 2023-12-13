import { DrawerBody, Flex, Heading, Icon, Stack } from '@chakra-ui/react'
import { FaCheck } from '@react-icons/all-files/fa/FaCheck'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useCart from '../../../hooks/useCart'
import Link from '../../Link/Link'

type Props = {
  chainId: number
}

const CartStepSuccess: FC<Props> = ({ chainId }) => {
  const { t } = useTranslation('components')
  const blockExplorer = useBlockExplorer(chainId)
  const { transactionHash } = useCart()
  return (
    <DrawerBody py={4} px={2}>
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
            {t('cart.step.success.title')}
          </Heading>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('cart.step.success.description')}
          </Heading>
          <Link
            href={blockExplorer.transaction(transactionHash) || ''}
            isExternal
            _hover={{
              textDecoration: 'underline',
            }}
          >
            {t('cart.step.success.action')}
          </Link>
        </Stack>
      </Stack>
    </DrawerBody>
  )
}

export default CartStepSuccess
