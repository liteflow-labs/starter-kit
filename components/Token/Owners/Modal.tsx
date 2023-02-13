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
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState, VFC } from 'react'
import { convertOwnership } from '../../../convert'
import { useFetchOwnersQuery } from '../../../graphql'
import List, { ListItem } from '../../List/List'
import Pagination from '../../Pagination/Pagination'
import OwnersModalActivator from './ModalActivator'
import OwnersModalItem from './ModalItem'

export type Props = {
  assetId: string
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

const OwnersModal: VFC<Props> = ({
  assetId,
  ownersPreview,
  numberOfOwners,
}) => {
  const { t } = useTranslation('components')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [page, setPage] = useState(1)
  const { data, loading, previousData } = useFetchOwnersQuery({
    variables: {
      assetId,
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
              {loading
                ? new Array(OwnerPaginationLimit)
                    .fill(0)
                    .map((_, index) => (
                      <ListItem
                        key={index}
                        image={<SkeletonCircle />}
                        label={<SkeletonText noOfLines={2} width="32" />}
                      />
                    ))
                : data?.ownerships?.nodes
                    .map(convertOwnership)
                    .map((owner) => (
                      <OwnersModalItem key={owner.address} {...owner} />
                    ))}
            </List>
          </ModalBody>
          <ModalFooter>
            <Box pt="4">
              <Pagination
                limit={OwnerPaginationLimit}
                page={page}
                total={
                  data?.ownerships?.totalCount ||
                  previousData?.ownerships?.totalCount
                }
                onPageChange={setPage}
                hideSelectors
                result={{
                  label: t('pagination.result.label'),
                  caption: (props) => (
                    <Trans
                      ns="templates"
                      i18nKey="pagination.result.caption"
                      values={props}
                      components={[
                        <Text as="span" color="brand.black" key="text" />,
                      ]}
                    />
                  ),
                  pages: (props) =>
                    t('pagination.result.pages', { count: props.total }),
                }}
              />
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default OwnersModal
