import { Button, Divider, HStack, Icon, IconButton } from '@chakra-ui/react'
import { FaAngleLeft } from '@react-icons/all-files/fa/FaAngleLeft'
import { FC, useCallback } from 'react'

type Props = {
  currencies:
    | {
        id: string
        decimals: number
        symbol: string
        approved: boolean
      }[]
    | undefined
  isDisabled?: boolean
  onBack: () => void
  onSubmit: () => void
}

const CartTransactionStepButton: FC<Props> = ({
  currencies,
  isDisabled,
  onBack,
  onSubmit,
}) => {
  const isAllApproved = currencies?.every((currency) => currency.approved)
  // TODO: add callback to approve currency
  const onApprove = useCallback((id: string | undefined) => console.log(id), [])
  return (
    <HStack gap={0} width="full">
      <IconButton
        aria-label="Continue"
        icon={<Icon as={FaAngleLeft} boxSize={5} />}
        isDisabled={isDisabled}
        borderRightRadius="none"
        onClick={onBack}
      />
      <Divider orientation="vertical" />
      <Button
        isDisabled={isDisabled}
        flexGrow={1}
        borderLeftRadius="none"
        onClick={() =>
          isAllApproved
            ? onSubmit()
            : onApprove(currencies?.filter((c) => !c.approved)[0]?.id)
        }
      >
        {isAllApproved
          ? 'Purchase'
          : `Approve ${currencies?.filter((c) => !c.approved)[0]?.symbol}`}
      </Button>
    </HStack>
  )
}

export default CartTransactionStepButton
