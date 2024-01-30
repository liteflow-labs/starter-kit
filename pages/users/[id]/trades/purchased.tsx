import {
  Box,
  Flex,
  Icon,
  IconButton,
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
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiExternalLink } from '@react-icons/all-files/hi/HiExternalLink'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
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
  TradesOrderBy,
  useFetchUserTradePurchasedQuery,
} from '../../../../graphql'
import { blockExplorer } from '../../../../hooks/useBlockExplorer'
import useCart from '../../../../hooks/useCart'
import useEnvironment from '../../../../hooks/useEnvironment'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../../layouts/large'
import { dateFromNow } from '../../../../utils'

const TradePurchasedPage: NextPage = () => {
  const { BASE_URL, PAGINATION_LIMIT, CHAINS } = useEnvironment()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<TradesOrderBy>('TIMESTAMP_DESC')
  const { changeLimit } = usePaginate()
  const userAddress = useRequiredQueryParamSingle('id')

  const { data, refetch } = useFetchUserTradePurchasedQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
    },
  })

  useCart({ onCheckout: refetch })

  const trades = data?.trades?.nodes

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
        currentTab="trades"
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
              <Link href={`/users/${userAddress}/trades`}>
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
                    {t('user.trade-purchased.nav.sold')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/trades/purchased`}>
                <Tag
                  size="lg"
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.trade-purchased.nav.purchased')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<TradesOrderBy>
                label={t('user.trade-purchased.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t(
                      'user.trade-purchased.orderBy.values.timestampDesc',
                    ),
                    value: 'TIMESTAMP_DESC',
                  },
                  {
                    label: t(
                      'user.trade-purchased.orderBy.values.timestampAsc',
                    ),
                    value: 'TIMESTAMP_ASC',
                  },
                  {
                    label: t('user.trade-purchased.orderBy.values.amountAsc'),
                    value: 'AMOUNT_IN_REF_ASC',
                  },
                  {
                    label: t('user.trade-purchased.orderBy.values.amountDesc'),
                    value: 'AMOUNT_IN_REF_DESC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          {trades === undefined ? (
            <Loader />
          ) : trades.length > 0 ? (
            <TableContainer bg="white" shadow="base" rounded="lg">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('user.trade-purchased.table.item')}</Th>
                    <Th isNumeric>{t('user.trade-purchased.table.price')}</Th>
                    <Th>{t('user.trade-purchased.table.from')}</Th>
                    <Th>{t('user.trade-purchased.table.created')}</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {trades.map((item, index) => (
                    <Tr fontSize="sm" key={index}>
                      <Td>
                        {item.asset ? (
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
                              {BigNumber.from(item.quantity).gt(1) && (
                                <Text
                                  as="span"
                                  variant="caption"
                                  color="gray.500"
                                >
                                  {t('user.trade-purchased.purchased', {
                                    value: item.quantity,
                                  })}
                                </Text>
                              )}
                            </Flex>
                          </Flex>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td isNumeric>
                        {item.currency ? (
                          <Text
                            as={Price}
                            noOfLines={1}
                            amount={item.amount}
                            currency={item.currency}
                          />
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>
                        <Avatar user={item.seller} />
                      </Td>
                      <Td>{dateFromNow(item.timestamp)}</Td>
                      <Td>
                        <IconButton
                          aria-label="external link"
                          as={Link}
                          href={
                            blockExplorer(
                              CHAINS,
                              item.asset?.chainId,
                            ).transaction(item.transactionHash) || '#'
                          }
                          isExternal
                          variant="outline"
                          colorScheme="gray"
                          rounded="full"
                        >
                          <HiExternalLink />
                        </IconButton>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Empty
              icon={<Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />}
              title={t('user.trade-purchased.table.empty.title')}
              description={t('user.trade-purchased.table.empty.description')}
            />
          )}
          {trades?.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onLimitChange={changeLimit}
              hasNextPage={data?.trades?.pageInfo.hasNextPage}
              hasPreviousPage={data?.trades?.pageInfo.hasPreviousPage}
            />
          )}
        </Stack>
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default TradePurchasedPage
