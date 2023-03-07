import { Flex, Text } from '@chakra-ui/react'
import { ButtonHTMLAttributes, VFC } from 'react'
import AccountImage from '../../Wallet/Image'

export type Props = ButtonHTMLAttributes<any> & {
  owners: {
    address: string
    image: string | null | undefined
    name: string | null | undefined
  }[]
  numberOfOwners: number
}

const OwnersModalActivator: VFC<Props> = ({
  owners,
  numberOfOwners,
  ...props
}) => {
  return (
    <Flex as="button" {...props}>
      {owners.slice(0, 4).map(({ address, image, name }, index) => (
        <Flex
          key={address}
          ml={index !== 0 ? -3 : undefined}
          title={name ? name : ''}
        >
          <Flex
            as={AccountImage}
            address={address}
            image={image}
            position="relative"
            rounded="full"
          />
        </Flex>
      ))}
      {numberOfOwners === 5 && owners[4] && (
        <Flex ml={-3} title={owners[4].name ? owners[4].name : ''}>
          <Flex
            as={AccountImage}
            address={owners[4].address}
            image={owners[4].image}
            rounded="full"
          />
        </Flex>
      )}
      {numberOfOwners > 5 && (
        <Flex ml={-3} zIndex={10}>
          <Flex
            h={8}
            w={8}
            align="center"
            justify="center"
            rounded="full"
            bgColor="brand.50"
          >
            <Text as="span" variant="caption" color="brand.500">
              {`+${numberOfOwners >= 103 ? 99 : owners.length - 4}`}
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default OwnersModalActivator
