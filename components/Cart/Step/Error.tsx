import { DrawerBody, Flex, Heading, Icon, Stack } from '@chakra-ui/react'
import { FaExclamation } from '@react-icons/all-files/fa/FaExclamation'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { formatError } from '../../../utils'

const CartStepError: FC<{ error: Error }> = ({ error }) => {
  const { t } = useTranslation('components')
  return (
    <DrawerBody py={4} px={2}>
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
            {t('cart.step.error.title')}
          </Heading>
          <Heading as="h5" variant="heading3" color="gray.500">
            {formatError(error) || t('cart.step.error.description')}
          </Heading>
        </Stack>
      </Stack>
    </DrawerBody>
  )
}

export default CartStepError
