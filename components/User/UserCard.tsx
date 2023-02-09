import { Avatar, Box, Flex, Icon, Text } from '@chakra-ui/react'
import { formatAddress } from '@nft/hooks'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import Image from 'components/Image/Image'
import Link from 'components/Link/Link'
import { FC } from 'react'

type Props = {
  user: {
    address: string
    image: string | null
    cover: string | null
    name: string | null
    verified: boolean
  }
}

const UserCard: FC<Props> = ({ user }) => {
  return (
    <Link href={`/users/${user.address}`}>
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.300"
        w="full"
        overflow="hidden"
      >
        <Box position="relative" height="7.5rem">
          {user.cover ? (
            <Image
              src={user.cover}
              alt={user.name || 'User cover image'}
              layout="fill"
              objectFit="cover"
              sizes="
                429px,
                (min-width: 30em) 50vw,
                (min-width: 48em) 33vw,
                (min-width: 62em) 25vw,
                (min-width: 80em) 290px"
            />
          ) : (
            <Box bg="gray.100" height="full" />
          )}
          <Box
            position="absolute"
            bottom={0}
            transform="translate(1rem, 50%)"
            bg="black"
            border="2px solid"
            borderColor="white"
            rounded="full"
          >
            <Avatar
              size="lg"
              src={user.image || undefined}
              title={user.name || user.address}
            />
          </Box>
        </Box>
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
          {user.verified && (
            <Icon as={HiBadgeCheck} color="brand.500" boxSize={4} />
          )}
        </Flex>
      </Box>
    </Link>
  )
}

export default UserCard
