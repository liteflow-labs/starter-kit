import { Box, Flex, RadioProps, Text, useRadio } from '@chakra-ui/react'
import { FC } from 'react'

type IProps<T = string> = RadioProps & {
  choice: {
    value: T
    label: string
    icon?: any
    disabled?: boolean
  }
}

const Radio: FC<IProps> = ({ choice, ...props }) => {
  const { getInputProps, getRadioProps } = useRadio(props)
  return (
    <Box
      as="label"
      pointerEvents={choice.disabled ? 'none' : undefined}
      w={{
        base: 'full',
        sm: 'auto',
      }}
      _focus={{
        borderWidth: '1px',
        borderColor: 'brand.500',
        ringColor: 'brand.500',
        ringOpacity: '1',
        outline: 'none',
      }}
    >
      <input {...getInputProps()} hidden />
      <Flex
        cursor={choice.disabled ? 'not-allowed' : 'pointer'}
        bgColor={choice.disabled || props.isChecked ? 'brand.50' : undefined}
        align="center"
        gap={4}
        rounded="xl"
        borderWidth="2px"
        borderColor={
          choice.disabled
            ? 'transparent'
            : props.isChecked
            ? 'brand.500'
            : 'gray.200'
        }
        py={7}
        pl={5}
        pr={4}
        transition="all 0.3s ease-in-out"
        shadow={props.isChecked ? 'md' : 'sm'}
        {...getRadioProps()}
      >
        {choice.icon && (
          <Box
            as={choice.icon}
            h={6}
            w={6}
            transition="all 0.3s ease-in-out"
            color={
              choice.disabled || !props.isChecked ? 'gray.400' : 'brand.black'
            }
          />
        )}
        <Text
          variant="button1"
          color="brand.black"
          cursor={choice.disabled ? 'not-allowed' : 'pointer'}
        >
          {choice.label}
        </Text>
      </Flex>
    </Box>
  )
}

export default Radio
