import {
  Box,
  Flex,
  Icon,
  Stack,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { useIsLoggedIn } from '@liteflow/react'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import AcceptOfferButton from '../../../../components/Button/AcceptOffer'
import Empty from '../../../../components/Empty/Empty'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import Loader from '../../../../components/Loader'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import Select from '../../../../components/Select/Select'
import Avatar from '../../../../components/User/Avatar'
import {
  OffersOrderBy,
  useFetchUserBidsReceivedQuery,
} from '../../../../graphql'
import useEnvironment from '../../../../hooks/useEnvironment'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../../layouts/large'
import { dateFromNow, formatError } from '../../../../utils'

type Props = {
  now: string
}

const BidReceivedPage: NextPage<Props> = ({ now }) => {
  const { BASE_URL, PAGINATION_LIMIT } = useEnvironment()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OffersOrderBy>('CREATED_AT_DESC')
  const { changeLimit } = usePaginate()
  const toast = useToast()
  const userAddress = useRequiredQueryParamSingle('id')
  const ownerLoggedIn = useIsLoggedIn(userAddress)

  const date = useMemo(() => new Date(now), [now])
  const { data, refetch } = useFetchUserBidsReceivedQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
      now: date,
    },
  })
  const bids = data?.bids?.nodes

  const onAccepted = useCallback(async () => {
    toast({
      title: t('user.bid-received.notifications.accepted'),
      status: 'success',
    })
    await refetch()
  }, [refetch, t, toast])

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  return (
    <LargeLayout>
      <UserProfileTemplate
        address={userAddress}
        currentTab="bids"
        loginUrlForReferral={BASE_URL + '/login'}
      >
        <Stack spacing={6}>
          <Flex
            justify={{ md: 'space-between' }}
            align={{ md: 'center' }}
            gap={4}
            direction={{ base: 'column', md: 'row' }}
          >
            <Flex as="nav" gap={2}>
              <Link href={`/users/${userAddress}/bids`}>
                <Tag
                  size="lg"
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.bid-received.nav.received')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/bids/placed`}>
                <Tag
                  size="lg"
                  variant="outline"
                  borderRadius="full"
                  boxShadow="none"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{
                    bgColor: 'gray.100',
                  }}
                >
                  <Text as="span" variant="text-sm" color="brand.black">
                    {t('user.bid-received.nav.placed')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<OffersOrderBy>
                label={t('user.bid-received.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('user.bid-received.orderBy.values.createdAtDesc'),
                    value: 'CREATED_AT_DESC',
                  },
                  {
                    label: t('user.bid-received.orderBy.values.createdAtAsc'),
                    value: 'CREATED_AT_ASC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          {bids === undefined ? (
            <Loader />
          ) : bids.length > 0 ? (
            <TableContainer bg="white" shadow="base" rounded="lg">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('user.bid-received.table.item')}</Th>
                    <Th isNumeric>{t('user.bid-received.table.price')}</Th>
                    <Th>{t('user.bid-received.table.from')}</Th>
                    <Th>{t('user.bid-received.table.created')}</Th>
                    <Th isNumeric></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bids.map((item) => (
                    <Tr fontSize="sm" key={item.id}>
                      <Td>
                        <Flex
                          as={Link}
                          href={`/tokens/${item.asset.id}`}
                          condition={!item.asset.deletedAt} // disable link if asset is deleted
                          gap={3}
                        >
                          <Image
                            src={item.asset.image}
                            alt={item.asset.name}
                            width={40}
                            height={40}
                            h={10}
                            w={10}
                            objectFit="cover"
                            rounded="2xl"
                            flexShrink={0}
                          />
                          <Flex
                            direction="column"
                            my="auto"
                            title={item.asset.name}
                          >
                            <Text as="span" noOfLines={1}>
                              {item.asset.name}
                            </Text>
                            {BigNumber.from(item.availableQuantity).gt(1) && (
                              <Text
                                as="span"
                                variant="caption"
                                color="gray.500"
                              >
                                {t('user.bid-received.requested', {
                                  value: item.availableQuantity,
                                })}
                              </Text>
                            )}
                          </Flex>
                        </Flex>
                      </Td>
                      <Td isNumeric>
                        <Text
                          as={Price}
                          noOfLines={1}
                          amount={BigNumber.from(item.unitPrice).mul(
                            item.availableQuantity,
                          )}
                          currency={item.currency}
                        />
                      </Td>
                      <Td>
                        <Avatar user={item.maker} />
                      </Td>
                      <Td>{dateFromNow(item.createdAt)}</Td>
                      <Td isNumeric>
                        {ownerLoggedIn &&
                          !item.asset.deletedAt && // only display accept button if asset and currency are not deleted
                          !item.currency.deletedAt && (
                            <AcceptOfferButton
                              offer={item}
                              title={t('user.bid-received.accept.title')}
                              variant="outline"
                              colorScheme="gray"
                              onAccepted={onAccepted}
                              onError={(e) =>
                                toast({
                                  status: 'error',
                                  title: formatError(e),
                                })
                              }
                            >
                              <Text as="span" isTruncated>
                                {t('user.bid-received.actions.accept')}
                              </Text>
                            </AcceptOfferButton>
                          )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Empty
              icon={<Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />}
              title={t('user.bid-received.table.empty.title')}
              description={t('user.bid-received.table.empty.description')}
            />
          )}
          {bids?.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onLimitChange={changeLimit}
              hasNextPage={data?.bids?.pageInfo.hasNextPage}
              hasPreviousPage={data?.bids?.pageInfo.hasPreviousPage}
            />
          )}
        </Stack>
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default BidReceivedPage
