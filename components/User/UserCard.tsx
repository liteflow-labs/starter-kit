import { AspectRatio, Box, Flex, Icon, Text } from '@chakra-ui/react'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { FC } from 'react'
import { AccountVerificationStatus } from '../../graphql'
import { formatAddress } from '../../utils'
import Image from '../Image/Image'
import Link from '../Link/Link'
import AccountImage from '../Wallet/Image'

type Props = {
  user: {
    address: string
    image: string | null
    cover: string | null
    name: string | null
    verification: {
      status: AccountVerificationStatus
    } | null
  }
}

const UserCard: FC<Props> = ({ user }) => {
  return (
    <Link href={`/users/${user.address}`} w="full">
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        shadow="sm"
        w="full"
        overflow="hidden"
      >
        <Flex w="full" position="relative" bg="gray.100">
          <AspectRatio w="full" ratio={3 / 2}>
            {user.cover ? (
              <Image
                src={user.cover}
                alt={user.name || 'User cover image'}
                fill
                sizes="
              (min-width: 80em) 292px,
              (min-width: 62em) 25vw,
              (min-width: 48em) 33vw,
              (min-width: 30em) 50vw,
              100vw"
                objectFit="cover"
              />
            ) : (
              <Box />
            )}
          </AspectRatio>
          <Flex
            position="absolute"
            bottom={-8}
            left={4}
            rounded="full"
            borderWidth="2px"
            borderColor="white"
          >
            <Flex
              as={AccountImage}
              address={user.address}
              image={user.image}
              size={60}
              rounded="full"
            />
          </Flex>
        </Flex>
        <Flex
          alignItems="center"
          gap={1.5}
          overflow="hidden"
          mt={1}
          pt={10}
          px={4}
          pb={4}
        >
          <Text variant="button1" title={user.name || user.address} isTruncated>
            {user.name || formatAddress(user.address, 10)}
          </Text>
          {user.verification?.status === 'VALIDATED' && (
            <Icon as={HiBadgeCheck} color="brand.500" boxSize={4} />
          )}
        </Flex>
      </Box>
    </Link>
  )
}

export default UserCard
