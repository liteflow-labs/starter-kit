import {
  Button,
  Divider,
  DrawerBody,
  DrawerFooter,
  Flex,
  Heading,
  Icon,
  Stack,
} from '@chakra-ui/react'
import { FaAngleLeft } from '@react-icons/all-files/fa/FaAngleLeft'
import { FaCheck } from '@react-icons/all-files/fa/FaCheck'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useCart from '../../../hooks/useCart'
import Link from '../../Link/Link'

type Props = {
  chainId: number
  onBack: () => void
}

const CartStepSuccess: FC<Props> = ({ chainId, onBack }) => {
  const { t } = useTranslation('components')
  const { address } = useAccount()
  const blockExplorer = useBlockExplorer(chainId)
  const { items, transactionHash } = useCart()
  return (
    <>
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
            <Button
              as={Link}
              href={blockExplorer.transaction(transactionHash) || ''}
              isExternal
              variant="outline"
              mt={3}
            >
              {t('cart.step.success.action')}
            </Button>
            <Button as={Link} href={`/users/${address}/owned`} mt={2}>
              {t('cart.step.success.owned')}
            </Button>
          </Stack>
        </Stack>
      </DrawerBody>
      {items.length > 0 && (
        <>
          <Divider />
          <DrawerFooter width="full">
            <Button
              leftIcon={<Icon as={FaAngleLeft} boxSize={5} />}
              iconSpacing={3}
              onClick={onBack}
              flexGrow={1}
            >
              {t('cart.step.success.back')}
            </Button>
          </DrawerFooter>
        </>
      )}
    </>
  )
}

export default CartStepSuccess
