import { Flex, Heading, Icon, Stack } from '@chakra-ui/react'
import { FaExclamation } from '@react-icons/all-files/fa/FaExclamation'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

const CartErrorStep: FC = () => {
  const { t } = useTranslation('components')
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
          {t('cart.step.error.title')}
        </Heading>
        <Heading as="h5" variant="heading3" color="gray.500">
          {t('cart.step.error.description')}
        </Heading>
      </Stack>
    </Stack>
  )
}

export default CartErrorStep
