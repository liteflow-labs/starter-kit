import { Flex, Text } from '@chakra-ui/react'
import { convertOwnership } from 'convert'
import { ButtonHTMLAttributes, FC, useMemo } from 'react'
import { AccountVerificationStatus } from '../../../graphql'
import AccountImage from '../../Wallet/Image'

export type Props = ButtonHTMLAttributes<any> & {
  ownerships: {
    totalCount: number
    nodes: {
      ownerAddress: string
      quantity: string
      owner: {
        address: string
        name: string | null
        image: string | null
        verification: {
          status: AccountVerificationStatus
        } | null
      }
    }[]
  }
}

const OwnersModalActivator: FC<Props> = ({ ownerships, ...props }) => {
  const numberOfOwners = ownerships.totalCount
  const owners = useMemo(
    () => ownerships.nodes.map(convertOwnership),
    [ownerships],
  )
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
              {`+${numberOfOwners >= 103 ? 99 : numberOfOwners - 4}`}
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default OwnersModalActivator
