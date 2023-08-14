import { Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { IoImageOutline } from '@react-icons/all-files/io5/IoImageOutline'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { Standard } from '../../graphql'
import Avatar from '../User/Avatar'
import OwnersModal from './Owners/Modal'
import Supply from './Supply'

export type Props = {
  chainId: number
  collectionAddress: string
  tokenId: string
  standard: Standard
  creator:
    | {
        address: string
        name: string | null | undefined
        image: string | null | undefined
        verified: boolean
      }
    | undefined
  owners: {
    address: string
    image: string | null | undefined
    name: string | null | undefined
    verified: boolean
    quantity: string
  }[]
  numberOfOwners: number
  saleSupply: BigNumber
  totalSupply: BigNumber | null | undefined
  isOpenCollection: boolean
}

const TokenMetadata: FC<Props> = ({
  chainId,
  collectionAddress,
  tokenId,
  standard,
  creator,
  owners,
  numberOfOwners,
  saleSupply,
  totalSupply,
  isOpenCollection,
}) => {
  const { t } = useTranslation('components')
  return (
    <Flex wrap="wrap" rowGap={6} columnGap={8}>
      {creator && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {isOpenCollection
              ? t('token.metadata.creator')
              : t('token.metadata.minted_by')}
          </Heading>
          <Avatar
            address={creator.address}
            image={creator.image}
            name={creator.name}
            verified={creator.verified}
          />
        </Stack>
      )}
      {numberOfOwners === 1 && owners[0] && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('token.metadata.owner')}
          </Heading>
          <Avatar
            address={owners[0].address}
            image={owners[0].image}
            name={owners[0].name}
            verified={owners[0].verified}
          />
        </Stack>
      )}
      {numberOfOwners > 1 && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('token.metadata.owners')}
          </Heading>
          <OwnersModal
            chainId={chainId}
            collectionAddress={collectionAddress}
            tokenId={tokenId}
            ownersPreview={owners}
            numberOfOwners={numberOfOwners}
          />
        </Stack>
      )}
      {standard === 'ERC721' && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('token.metadata.edition')}
          </Heading>
          <Flex align="center" display="inline-flex" h="full">
            <Icon as={IoImageOutline} mr={2} h={4} w={4} color="gray.500" />
            <Text as="span" variant="subtitle2" color="gray.500">
              {t('token.metadata.single')}
            </Text>
          </Flex>
        </Stack>
      )}
      {standard === 'ERC1155' && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('token.metadata.edition')}
          </Heading>
          <Supply
            current={saleSupply}
            total={totalSupply || BigNumber.from('0')}
          />
        </Stack>
      )}
    </Flex>
  )
}

export default TokenMetadata
