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
import { dateFromNow, formatError, useIsLoggedIn } from '@nft/hooks'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Empty from '../../../../components/Empty/Empty'
import Head from '../../../../components/Head'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import Loader from '../../../../components/Loader'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import SaleAuctionAction from '../../../../components/Sales/Auction/Action'
import SaleAuctionStatus from '../../../../components/Sales/Auction/Status'
import Select from '../../../../components/Select/Select'
import {
  convertAuctionFull,
  convertAuctionWithBestBid,
  convertFullUser,
} from '../../../../convert'
import environment from '../../../../environment'
import { AuctionsOrderBy, useFetchUserAuctionsQuery } from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useEagerConnect from '../../../../hooks/useEagerConnect'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'

type Props = {
  now: string
}

const AuctionPage: NextPage<Props> = ({ now }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { address } = useAccount()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<AuctionsOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const toast = useToast()
  const userAddress = useRequiredQueryParamSingle('id')
  const ownerLoggedIn = useIsLoggedIn(userAddress)

  const date = useMemo(() => new Date(now), [now])
  const { data, refetch, loading } = useFetchUserAuctionsQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
      now: date,
    },
  })

  const userAccount = useMemo(
    () => convertFullUser(data?.account || null, userAddress),
    [data, userAddress],
  )

  const auctions = useMemo(
    () =>
      (data?.auctions?.nodes || []).map((x) => ({
        ...convertAuctionWithBestBid(x),
        ...convertAuctionFull(x),
        asset: x.asset,
        createdAt: new Date(x.createdAt),
        ownAsset:
          parseInt(x.asset.ownerships.aggregates?.sum?.quantity || '0', 10) > 0,
      })),
    [data],
  )

  const onAuctionAccepted = useCallback(async () => {
    try {
      toast({
        title: t('user.auctions.notifications.accepted'),
        status: 'success',
      })
      await refetch()
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    }
  }, [toast, t, refetch])

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  if (loading) return <Loader fullPage />
  return (
    <LargeLayout>
      <Head
        title={userAccount?.name || userAddress}
        description={userAccount?.description || ''}
        image={userAccount?.image || ''}
      />

      <UserProfileTemplate
        signer={signer}
        currentAccount={address}
        account={userAccount}
        currentTab="offers"
        totals={
          new Map([
            ['created', data?.created?.totalCount || 0],
            ['on-sale', data?.onSale?.totalCount || 0],
            ['owned', data?.owned?.totalCount || 0],
          ])
        }
        loginUrlForReferral={environment.BASE_URL + '/login'}
      >
        <Stack spacing={6}>
          <Flex
            justify={{ md: 'space-between' }}
            align={{ md: 'center' }}
            gap={4}
            direction={{ base: 'column', md: 'row' }}
          >
            <Flex as="nav" gap={2}>
              <Link href={`/users/${userAddress}/offers`}>
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
                    {t('user.auctions.nav.fixed')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/offers/auction`}>
                <Tag
                  size="lg"
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.auctions.nav.auction')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<AuctionsOrderBy>
                label={t('user.auctions.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('user.auctions.orderBy.values.createdAtDesc'),
                    value: 'CREATED_AT_DESC',
                  },
                  {
                    label: t('user.auctions.orderBy.values.createdAtAsc'),
                    value: 'CREATED_AT_ASC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          <TableContainer bg="white" shadow="base" rounded="lg">
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('user.auctions.table.item')}</Th>
                  <Th isNumeric>{t('user.auctions.table.price')}</Th>
                  <Th>{t('user.auctions.table.status')}</Th>
                  <Th>{t('user.auctions.table.created')}</Th>
                  <Th isNumeric></Th>
                </Tr>
              </Thead>
              <Tbody>
                {auctions.map((item) => (
                  <Tr fontSize="sm" key={item.id}>
                    <Td>
                      <Flex as={Link} href={`/tokens/${item.asset.id}`} gap={3}>
                        <Image
                          src={item.asset.image}
                          alt={item.asset.name}
                          width={40}
                          height={40}
                          layout="fixed"
                          objectFit="cover"
                          rounded="full"
                          h={10}
                          w={10}
                        />
                        <Flex
                          my="auto"
                          direction="column"
                          title={item.asset.name}
                        >
                          <Text as="span" noOfLines={1}>
                            {item.asset.name}
                          </Text>
                        </Flex>
                      </Flex>
                    </Td>
                    <Td isNumeric>
                      {item.bestBid ? (
                        <Text
                          as={Price}
                          noOfLines={1}
                          amount={item.bestBid.unitPrice}
                          currency={item.bestBid.currency}
                        />
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      <SaleAuctionStatus
                        auction={item}
                        bestBid={item.bestBid}
                      />
                    </Td>
                    <Td>{dateFromNow(item.createdAt)}</Td>
                    <Td isNumeric>
                      {ownerLoggedIn && item.ownAsset && (
                        <SaleAuctionAction
                          signer={signer}
                          auction={item}
                          bestBid={item.bestBid}
                          onAuctionAccepted={onAuctionAccepted}
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {auctions.length === 0 && (
              <Empty
                icon={
                  <Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />
                }
                title={t('user.auctions.table.empty.title')}
                description={t('user.auctions.table.empty.description')}
              />
            )}
          </TableContainer>

          <Pagination
            limit={limit}
            limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
            onLimitChange={changeLimit}
            onPageChange={changePage}
            page={page}
            total={data?.auctions?.totalCount || 0}
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
        </Stack>
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default AuctionPage
