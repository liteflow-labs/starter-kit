import { Flex, Text } from '@chakra-ui/react'
import { Link } from '@nft/components'
import { FC } from 'react'

const Banner: FC = () => {
  const isDemo = process.env.NEXT_PUBLIC_ENVIRONMENT === 'demo'
  return (
    <Flex
      position="fixed"
      top={0}
      zIndex={50}
      h={12}
      w="full"
      bgColor="secondary.black"
      align="center"
      fontFamily="banner"
    >
      <Flex
        as={Link}
        href="https://liteflow.com"
        h="full"
        w={12}
        align="center"
        justify="center"
        bgColor="secondary.500"
        isExternal
      >
        <svg
          width="20"
          height="24"
          viewBox="0 0 20 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.3319 1.43433C18.1652 0.877454 17.8941 0.360873 17.5057 0C11.8417 5.67322 6.14281 11.3794 0.504395 17.027C2.43333 17.027 4.83488 17.027 6.28936 17.0197C9.80467 13.5208 13.657 9.69595 17.1614 6.19163C18.5096 4.8434 18.8741 3.24237 18.3319 1.43433Z"
            fill="white"
          />
          <path
            d="M17.9674 19.7032C17.6999 18.8166 17.1504 18.1242 16.4909 17.4977C16.2473 17.2668 15.9908 17.0159 15.9908 17.0159C15.9908 17.0159 16.2564 16.7521 16.4982 16.5103C16.9763 16.0322 17.4398 15.5412 17.9344 15.0796C19.1764 13.9182 19.6911 12.504 19.4292 10.8261C19.3028 10.0201 18.9639 9.30015 18.451 8.74877C15.6428 11.5552 12.873 14.3231 10.1436 17.0507C12.4041 19.3185 14.7177 21.6376 17.0459 23.9751C18.0883 22.7569 18.4235 21.209 17.9674 19.7032Z"
            fill="white"
          />
          <path
            d="M17.0458 23.9752C16.9945 24.0448 17.0825 23.9422 17.0458 23.9752V23.9752Z"
            fill="white"
          />
        </svg>
      </Flex>
      <Flex
        display={{ base: 'none', md: 'flex' }}
        fontSize="sm"
        ml={4}
        fontWeight="semibold"
        lineHeight={5}
        color="white"
      >
        The Web3 as a Service Company
      </Flex>
      <Flex
        display={{ base: 'none', md: 'flex' }}
        align="center"
        rounded="full"
        bgColor={isDemo ? 'secondary.100' : 'red.100'}
        mx={3}
      >
        <Text
          as="span"
          py={1}
          px={3}
          fontSize="xs"
          fontWeight="medium"
          lineHeight={4}
          color={isDemo ? 'secondary.500' : 'red.500'}
        >
          {isDemo ? 'Demo Preview' : 'Test Preview'}
        </Text>
      </Flex>
      <Flex
        as={Link}
        href="https://meetings.hubspot.com/alan364/liteflow-discovery-call"
        isExternal
        mr={{ base: 5, lg: 8 }}
        ml="auto"
        align="center"
        rounded="4px"
        bgColor="secondary.500"
        py={1}
        px={3}
        shadow="sm"
        _hover={{
          bgColor: 'secondary.accent',
        }}
      >
        <Text
          as="span"
          fontSize="xs"
          fontWeight="semibold"
          lineHeight={4}
          color="white"
        >
          Talk to an Expert
        </Text>
      </Flex>
    </Flex>
  )
}

export default Banner
