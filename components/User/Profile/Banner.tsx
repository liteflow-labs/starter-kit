import { Flex } from '@chakra-ui/react'
import { VFC } from 'react'
import Image from '../../Image/Image'
import AccountImage from '../../Wallet/Image'

type Props = {
  address: string
  cover: string | null | undefined
  image: string | null | undefined
  name: string | null | undefined
}

const UserProfileBanner: VFC<Props> = ({ cover, image, address, name }) => {
  if (!address) throw new Error('account is falsy')

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
      {cover && (
        <Image
          src={cover}
          alt={name || address}
          layout="fill"
          objectFit="cover"
          rounded="xl"
          sizes="
          (min-width: 80em) 1216px,
          100vw"
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
          image={image}
          size={88}
          rounded="full"
        />
      </Flex>
    </Flex>
  )
}

export default UserProfileBanner
