import { Box, Flex, RadioProps, useRadio } from '@chakra-ui/react'
import { FC } from 'react'

const CartRadio: FC<RadioProps> = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props)
  return (
    <Box as="label" w="full">
      <input {...getInputProps()} hidden />
      <Flex
        flexDirection="column"
        cursor="pointer"
        gap={2}
        rounded="md"
        borderWidth="2px"
        borderColor={props.isChecked ? 'brand.500' : 'inherit'}
        p={2}
        transition="all 0.3s ease-in-out"
        shadow={props.isChecked ? 'md' : 'sm'}
        h="full"
        {...getRadioProps()}
      >
        {props.children}
      </Flex>
    </Box>
  )
}

export default CartRadio
