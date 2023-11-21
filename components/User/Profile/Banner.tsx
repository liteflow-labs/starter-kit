import { Flex } from '@chakra-ui/react'
import { FC } from 'react'
import Image from '../../Image/Image'
import AccountImage from '../../Wallet/Image'

type Props = {
  address: string
  user:
    | {
        cover: string | null
        image: string | null
        name: string | null
      }
    | null
    | undefined
}

const UserProfileBanner: FC<Props> = ({ address, user }) => {
  return (
    <Flex
      as="header"
      position="relative"
      zIndex={-1}
      mb={20}
      h="200px"
      w="full"
      rounded="xl"
      bgColor="gray.100"
    >
      {user?.cover && (
        <Image
          src={user.cover}
          alt={user.name || address}
          fill
          sizes="
          (min-width: 80em) 1216px,
          100vw"
          objectFit="cover"
        />
      )}
      <Flex
        position="absolute"
        bottom={-12}
        left={6}
        rounded="full"
        borderWidth="4px"
        borderColor="white"
      >
        <Flex
          as={AccountImage}
          address={address}
          image={user?.image}
          size={88}
          rounded="full"
        />
      </Flex>
    </Flex>
  )
}

export default UserProfileBanner
