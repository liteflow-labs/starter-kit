import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SkeletonCircle,
  SkeletonText,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import { convertOwnership } from '../../../convert'
import { useFetchOwnersQuery } from '../../../graphql'
import List, { ListItem } from '../../List/List'
import Pagination from '../../Pagination/Pagination'
import OwnersModalActivator from './ModalActivator'
import OwnersModalItem from './ModalItem'

export type Props = {
  chainId: number
  collectionAddress: string
  tokenId: string
  ownersPreview: {
    address: string
    image: string | null | undefined
    name: string | null | undefined
    verified: boolean
    quantity: string
  }[]
  numberOfOwners: number
}

const OwnerPaginationLimit = 8

const OwnersModal: FC<Props> = ({
  chainId,
  collectionAddress,
  tokenId,
  ownersPreview,
  numberOfOwners,
}) => {
  const { t } = useTranslation('components')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [page, setPage] = useState(1)
  const { data } = useFetchOwnersQuery({
    variables: {
      chainId,
      collectionAddress,
      tokenId,
      limit: OwnerPaginationLimit,
      offset: (page - 1) * OwnerPaginationLimit,
    },
  })

  // Reset pagination when the limit change or the modal visibility changes
  useEffect(() => setPage(1), [isOpen])

  return (
    <>
      <OwnersModalActivator
        owners={ownersPreview}
        numberOfOwners={numberOfOwners}
        onClick={onOpen}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex>
              {t('token.owners.title')}
              <Flex
                bgColor="brand.50"
                my="auto"
                ml={3}
                align="center"
                justify="center"
                rounded="lg"
                py={0.5}
                px={2.5}
              >
                <Text as="span" variant="caption" color="brand.500">
                  {numberOfOwners}
                </Text>
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            maxHeight={{ base: '', md: 'lg' }}
            minHeight={{ base: '', md: 'lg' }}
          >
            <List>
              {!data
                ? new Array(OwnerPaginationLimit)
                    .fill(0)
                    .map((_, index) => (
                      <ListItem
                        key={index}
                        image={<SkeletonCircle />}
                        label={<SkeletonText noOfLines={2} width="32" />}
                      />
                    ))
                : data.ownerships?.nodes
                    .map(convertOwnership)
                    .map((owner) => (
                      <OwnersModalItem key={owner.address} {...owner} />
                    ))}
            </List>
          </ModalBody>
          <ModalFooter>
            <Box pt="4">
              <Pagination
                page={page}
                onPageChange={setPage}
                hasNextPage={data?.ownerships?.pageInfo.hasNextPage}
                hasPreviousPage={data?.ownerships?.pageInfo.hasPreviousPage}
                withoutLimit
              />
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default OwnersModal
