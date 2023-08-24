import {
  Box,
  Button,
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
import CancelOfferButton from '../../../../components/Button/CancelOffer'
import Empty from '../../../../components/Empty/Empty'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import Loader from '../../../../components/Loader'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import Select from '../../../../components/Select/Select'
import { convertSaleFull } from '../../../../convert'
import environment from '../../../../environment'
import { OffersOrderBy, useFetchUserFixedPriceQuery } from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'
import { dateFromNow, formatError } from '../../../../utils'

const FixedPricePage: NextPage = () => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { address } = useAccount()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OffersOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const toast = useToast()
  const userAddress = useRequiredQueryParamSingle('id')
  const ownerLoggedIn = useIsLoggedIn(userAddress)

  const { data, refetch } = useFetchUserFixedPriceQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
    },
  })

  const onCanceled = useCallback(async () => {
    toast({
      title: t('user.fixed.notifications.canceled'),
      status: 'success',
    })
    await refetch()
  }, [refetch, toast, t])

  const offers = useMemo(
    () =>
      data?.offers?.nodes.map((x) => ({
        ...convertSaleFull(x),
        createdAt: new Date(x.createdAt),
        asset: x.asset,
        ownAsset: BigNumber.from(x.asset.owned?.quantity || 0).gt(0),
      })),
    [data],
  )

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  return (
    <LargeLayout>
      <UserProfileTemplate
        signer={signer}
        currentAccount={address}
        address={userAddress}
        currentTab="offers"
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
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.fixed.nav.fixed')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/offers/auction`}>
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
                    {t('user.fixed.nav.auction')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<OffersOrderBy>
                label={t('user.fixed.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('user.fixed.orderBy.values.createdAtDesc'),
                    value: 'CREATED_AT_DESC',
                  },
                  {
                    label: t('user.fixed.orderBy.values.createdAtAsc'),
                    value: 'CREATED_AT_ASC',
                  },
                  {
                    label: t('user.fixed.orderBy.values.unitPriceAsc'),
                    value: 'UNIT_PRICE_IN_REF_ASC',
                  },
                  {
                    label: t('user.fixed.orderBy.values.unitPriceDesc'),
                    value: 'UNIT_PRICE_IN_REF_DESC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          {offers === undefined ? (
            <Loader />
          ) : offers.length > 0 ? (
            <TableContainer bg="white" shadow="base" rounded="lg">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('user.fixed.table.item')}</Th>
                    <Th isNumeric>{t('user.fixed.table.price')}</Th>
                    <Th>{t('user.fixed.table.status')}</Th>
                    <Th>{t('user.fixed.table.created')}</Th>
                    <Th isNumeric></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {offers.map((item) => (
                    <Tr fontSize="sm" key={item.id}>
                      <Td>
                        <Flex
                          as={Link}
                          href={`/tokens/${item.asset.id}`}
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
                              <Text
                                as="span"
                                variant="caption"
                                color="gray.500"
                              >
                                {t('user.fixed.available', {
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
                          amount={item.unitPrice}
                          currency={item.currency}
                        />
                      </Td>
                      <Td>
                        {item.expiredAt && item.expiredAt <= new Date()
                          ? t('user.fixed.status.expired')
                          : t('user.fixed.status.active')}
                      </Td>
                      <Td>{dateFromNow(item.createdAt)}</Td>
                      <Td isNumeric>
                        {ownerLoggedIn && (
                          <>
                            {!item.expiredAt || item.expiredAt > new Date() ? (
                              <CancelOfferButton
                                variant="outline"
                                colorScheme="gray"
                                signer={signer}
                                offerId={item.id}
                                chainId={item.asset.chainId}
                                onCanceled={onCanceled}
                                onError={(e) =>
                                  toast({
                                    status: 'error',
                                    title: formatError(e),
                                  })
                                }
                                title={t('user.fixed.cancel.title')}
                              >
                                <Text as="span" isTruncated>
                                  {t('user.fixed.actions.cancel')}
                                </Text>
                              </CancelOfferButton>
                            ) : item.ownAsset ? (
                              <Button
                                as={Link}
                                href={`/tokens/${item.asset.id}/offer`}
                                variant="outline"
                                colorScheme="gray"
                              >
                                <Text as="span" isTruncated>
                                  {t('user.fixed.actions.new')}
                                </Text>
                              </Button>
                            ) : (
                              '-'
                            )}
                          </>
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
              title={t('user.fixed.table.empty.title')}
              description={t('user.fixed.table.empty.description')}
            />
          )}
          {offers?.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onPageChange={changePage}
              onLimitChange={changeLimit}
              hasNextPage={data?.offers?.pageInfo.hasNextPage}
              hasPreviousPage={data?.offers?.pageInfo.hasPreviousPage}
            />
          )}
        </Stack>
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default FixedPricePage
