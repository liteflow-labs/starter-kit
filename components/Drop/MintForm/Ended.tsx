import {
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import numbro from 'numbro'
import { FC, JSX, useMemo } from 'react'
import Link from '../../Link/Link'

type Props = {
  collection: {
    address: string
    chainId: number
  }
  drops: {
    minted: string
  }[]
}

const MintFormEnded: FC<Props> = ({ collection, drops }): JSX.Element => {
  const totalMinted = useMemo(
    () =>
      drops.reduce((acc, drop) => {
        return acc + BigNumber(drop.minted).toNumber()
      }, 0),
    [drops],
  )
  return (
    <Box
      borderWidth={{ base: '0px', sm: '1px' }}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="grayAlpha.700"
      borderRadius={{ base: 'none', sm: '2xl' }}
      width="full"
      overflow="hidden"
    >
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={4}
        width="full"
        p={4}
        bg="grayAlpha.800"
        alignItems="center"
      >
        <Box gap={1} width="full">
          <Heading variant="headline5">Mint ended</Heading>
          <HStack alignItems="center" spacing={1}>
            <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
              Minted:
            </Text>
            <Text variant="subtitle2">
              {numbro(totalMinted).format({
                thousandSeparated: true,
              })}{' '}
              items
            </Text>
          </HStack>
        </Box>
        <Button
          as={Link}
          href={`/collection/${collection.chainId}/${collection.address}`}
        >
          View collection
        </Button>
      </SimpleGrid>
    </Box>
  )
}

export default MintFormEnded
