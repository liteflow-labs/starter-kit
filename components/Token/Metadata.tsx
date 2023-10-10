import { Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { IoImageOutline } from '@react-icons/all-files/io5/IoImageOutline'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { AccountVerificationStatus, MintType, Standard } from '../../graphql'
import Avatar from '../User/Avatar'
import OwnersModal from './Owners/Modal'
import Supply from './Supply'

export type Props = {
  asset: {
    chainId: number
    collectionAddress: string
    tokenId: string
    quantity: string
    collection: {
      standard: Standard
      mintType: MintType
    }
    creator: {
      address: string
      name: string | null
      image: string | null
      verification: {
        status: AccountVerificationStatus
      } | null
    }
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
    sales: {
      totalAvailableQuantitySum: string
    }
  }
}

const TokenMetadata: FC<Props> = ({ asset }) => {
  const { t } = useTranslation('components')

  const isOpenCollection = asset.collection.mintType === 'PUBLIC'
  const numberOfOwners = asset.ownerships.totalCount
  const saleSupply = BigNumber.from(asset.sales.totalAvailableQuantitySum)
  const totalSupply = BigNumber.from(asset.quantity)
  const owners = asset.ownerships.nodes

  return (
    <Flex wrap="wrap" rowGap={6} columnGap={8}>
      {asset.creator && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {isOpenCollection
              ? t('token.metadata.creator')
              : t('token.metadata.minted_by')}
          </Heading>
          <Avatar user={asset.creator} />
        </Stack>
      )}
      {numberOfOwners === 1 && owners[0] && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('token.metadata.owner')}
          </Heading>
          <Avatar user={owners[0].owner} />
        </Stack>
      )}
      {numberOfOwners > 1 && (
        <Stack spacing={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('token.metadata.owners')}
          </Heading>
          <OwnersModal asset={asset} />
        </Stack>
      )}
      {asset.collection.standard === 'ERC721' && (
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
      {asset.collection.standard === 'ERC1155' && (
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
