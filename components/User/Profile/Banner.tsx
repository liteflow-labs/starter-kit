import { Box, Flex } from '@chakra-ui/react'
import React, { VFC } from 'react'
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
          height={200}
          width={1440}
          objectFit="cover"
          rounded="xl"
        />
      )}
      <Box
        position="absolute"
        bottom={-12}
        left={6}
        h={24}
        w={24}
        overflow="hidden"
        rounded="full"
        borderWidth="4px"
        borderColor="white"
        bgColor="white"
      >
        <AccountImage address={address} image={image} size={96} />
      </Box>
    </Flex>
  )
}

export default UserProfileBanner
