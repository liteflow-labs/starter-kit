import {
  Box,
  Flex,
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
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import {
  AcceptOfferStep,
  dateFromNow,
  formatAddress,
  formatError,
  useAcceptOffer,
  useIsLoggedIn,
} from '@nft/hooks'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import ButtonWithNetworkSwitch from '../../../../components/Button/SwitchNetwork'
import Head from '../../../../components/Head'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import AcceptOfferModal from '../../../../components/Modal/AcceptOffer'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import Select from '../../../../components/Select/Select'
import { convertBidFull, convertFullUser } from '../../../../convert'
import environment from '../../../../environment'
import {
  FetchUserBidsReceivedDocument,
  FetchUserBidsReceivedQuery,
  OfferOpenBuysOrderBy,
  useFetchUserBidsReceivedQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useBlockExplorer from '../../../../hooks/useBlockExplorer'
import useEagerConnect from '../../../../hooks/useEagerConnect'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'
import { getLimit, getOffset, getOrder } from '../../../../params'
import { wrapServerSideProps } from '../../../../props'

type Props = {
  userAddress: string
  now: string
  meta: {
    title: string
    description: string
    image: string
  }
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (context, client) => {
    const userAddress = context.params?.id
      ? Array.isArray(context.params.id)
        ? context.params.id[0]?.toLowerCase()
        : context.params.id.toLowerCase()
      : null
    invariant(userAddress, 'userAddress is falsy')
    const limit = getLimit(context, environment.PAGINATION_LIMIT)
    const orderBy = getOrder<OfferOpenBuysOrderBy>(context, 'CREATED_AT_DESC')
    const offset = getOffset(context, environment.PAGINATION_LIMIT)
    const now = new Date()
    const { data, error } = await client.query<FetchUserBidsReceivedQuery>({
      query: FetchUserBidsReceivedDocument,
      variables: {
        limit,
        offset,
        orderBy,
        address: userAddress,
        now,
      },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {
        userAddress,
        now: now.toJSON(),
        meta: {
          title: data.account?.name || userAddress,
          description: data.account?.description || '',
          image: data.account?.image || '',
        },
      },
    }
  },
)

const BidReceivedPage: NextPage<Props> = ({ meta, now, userAddress }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { address } = useAccount()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OfferOpenBuysOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const [accept, { activeStep, transactionHash }] = useAcceptOffer(signer)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
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

  const bids = useMemo(
    () =>
      (data?.bids?.nodes || []).map((x) => ({
        ...convertBidFull(x),
        asset: {
          image: x.asset.image,
          name: x.asset.name,
          chainId: x.asset.chainId,
        },
      })),
    [data],
  )

  const userAccount = useMemo(
    () => convertFullUser(data?.account || null, userAddress),
    [data, userAddress],
  )

  const blockExplorer = useBlockExplorer(
    environment.BLOCKCHAIN_EXPLORER_NAME,
    environment.BLOCKCHAIN_EXPLORER_URL,
  )

  const handleAcceptOffer = useCallback(
    async (bid: typeof bids[0]) => {
      try {
        onOpen()
        await accept(bid, bid.availableQuantity)
        toast({
          title: t('user.bid-received.notifications.accepted'),
          status: 'success',
        })
        await refetch()
      } catch (e) {
        toast({
          title: formatError(e),
          status: 'error',
        })
      } finally {
        onClose()
      }
    },
    [accept, onClose, onOpen, refetch, t, toast],
  )

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  return (
    <LargeLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />
      <UserProfileTemplate
        signer={signer}
        account={userAccount}
        currentAccount={address}
        currentTab="bids"
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
              <Select<OfferOpenBuysOrderBy>
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
                      <Flex gap={3}>
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
                          direction="column"
                          my="auto"
                          title={item.asset.name}
                        >
                          <Text as="span" noOfLines={1}>
                            {item.asset.name}
                          </Text>
                          {item.availableQuantity.gt(1) && (
                            <Text as="span" variant="caption" color="gray.500">
                              {t('user.bid-received.requested', {
                                value: item.availableQuantity.toString(),
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
                        amount={item.unitPrice.mul(item.availableQuantity)}
                        currency={item.currency}
                      />
                    </Td>
                    <Td>{formatAddress(item.maker.address)}</Td>
                    <Td>{dateFromNow(item.createdAt)}</Td>
                    <Td isNumeric>
                      {ownerLoggedIn && (
                        <ButtonWithNetworkSwitch
                          chainId={item.asset.chainId}
                          variant="outline"
                          colorScheme="gray"
                          disabled={activeStep !== AcceptOfferStep.INITIAL}
                          onClick={() => handleAcceptOffer(item)}
                        >
                          <Text as="span" isTruncated>
                            {t('user.bid-received.actions.accept')}
                          </Text>
                        </ButtonWithNetworkSwitch>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Pagination
            limit={limit}
            limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
            onLimitChange={changeLimit}
            onPageChange={changePage}
            page={page}
            total={data?.bids?.totalCount || 0}
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

          <AcceptOfferModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('user.bid-received.accept.title')}
            step={activeStep}
            blockExplorer={blockExplorer}
            transactionHash={transactionHash}
          />
        </Stack>
      </UserProfileTemplate>
      )
    </LargeLayout>
  )
}

export default BidReceivedPage
