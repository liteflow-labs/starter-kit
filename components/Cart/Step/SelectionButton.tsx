import { Button, Divider, HStack, Icon, IconButton } from '@chakra-ui/react'
import { FaAngleRight } from '@react-icons/all-files/fa/FaAngleRight'
import { FC } from 'react'
import Image from '../../Image/Image'

type Props = {
  chain:
    | {
        name: string
        image: string
      }
    | undefined
  isDisabled: boolean
  onClick: () => void
}

const CartSelectionStepButton: FC<Props> = ({ chain, isDisabled, onClick }) => {
  return (
    <HStack gap={0} width="full">
      <Button
        isDisabled={isDisabled}
        flexGrow={1}
        borderRightRadius="none"
        onClick={onClick}
      >
        Continue with
        {chain && (
          <Image
            src={chain.image}
            alt={chain.name}
            width={16}
            height={16}
            h={4}
            w={4}
            ml={1}
          />
        )}
      </Button>
      <Divider orientation="vertical" />
      <IconButton
        aria-label="Continue"
        icon={<Icon as={FaAngleRight} boxSize={5} />}
        isDisabled={isDisabled}
        borderLeftRadius="none"
        onClick={onClick}
      />
    </HStack>
  )
}

export default CartSelectionStepButton
