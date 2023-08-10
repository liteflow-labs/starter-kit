import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import numbro from 'numbro'
import { FC, JSX } from 'react'
import Countdown from '../../Countdown/Countdown'
import Image from '../../Image/Image'
import Price from '../../Price/Price'

type Props = {
  drop: {
    name: string
    startDate: Date
    unitPrice: string
    supply: string | null
    maxQuantityPerWallet: string | null
    currency: {
      decimals: number
      symbol: string
      image: string
    }
  }
}

const MintFormUpcoming: FC<Props> = ({ drop }): JSX.Element => {
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
        <Flex flexDirection="column" gap={1} width="full">
          <Heading variant="headline5" title={drop.name} noOfLines={1}>
            {drop.name}
          </Heading>
          <HStack alignItems="center" spacing={1}>
            <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
              Price:
            </Text>
            <Image
              src={drop.currency.image}
              alt={drop.currency.symbol}
              width={12}
              height={12}
            />
            <Text variant="subtitle2">
              <Price amount={drop.unitPrice} currency={drop.currency} />
            </Text>
          </HStack>
          {drop.supply && (
            <HStack alignItems="center" spacing={1}>
              <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
                Supply:
              </Text>
              <Text variant="subtitle2">
                {numbro(drop.supply).format({
                  thousandSeparated: true,
                })}
              </Text>
            </HStack>
          )}
          {drop.maxQuantityPerWallet && (
            <HStack alignItems="center" spacing={1}>
              <Text variant="subtitle2" color="grayAlpha.500" mr={2}>
                Mint limit:
              </Text>
              <Text variant="subtitle2">
                {numbro(drop.maxQuantityPerWallet).format({
                  thousandSeparated: true,
                })}{' '}
                per wallet
              </Text>
            </HStack>
          )}
        </Flex>
        <Button isDisabled>Minting soon</Button>
      </SimpleGrid>
      <Divider />
      <Flex alignItems="center" justifyContent="center" px={4} py={3}>
        <Text variant="subtitle2">
          Starts in <Countdown date={drop.startDate} />
        </Text>
      </Flex>
    </Box>
  )
}

export default MintFormUpcoming
