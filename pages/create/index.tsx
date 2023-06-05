import {
  Box,
  Flex,
  Heading,
  Icon,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiExclamationCircle } from '@react-icons/all-files/hi/HiExclamationCircle'
import { IoImageOutline } from '@react-icons/all-files/io5/IoImageOutline'
import { IoImagesOutline } from '@react-icons/all-files/io5/IoImagesOutline'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import Empty from '../../components/Empty/Empty'
import Head from '../../components/Head'
import Link from '../../components/Link/Link'
import BackButton from '../../components/Navbar/BackButton'
import environment from '../../environment'
import {
  CollectionFilter,
  useFetchCollectionsAndAccountVerificationStatusQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import SmallLayout from '../../layouts/small'

const collectionsFilter = {
  or: environment.MINTABLE_COLLECTIONS.map(({ chainId, address }) => ({
    chainId: { equalTo: chainId },
    address: { equalTo: address },
  })),
} as CollectionFilter

const Layout = ({ children }: { children: React.ReactNode }) => (
  <SmallLayout>
    <Head
      title="Create an NFT"
      description="Create your NFT securely stored on blockchain"
    />
    {children}
  </SmallLayout>
)

const CreatePage: NextPage = () => {
  const { t } = useTranslation('templates')
  const { back } = useRouter()
  const { address } = useAccount()
  const { data, previousData } =
    useFetchCollectionsAndAccountVerificationStatusQuery({
      variables: {
        account: address || '',
        collectionFilter: collectionsFilter,
        fetchCollections: environment.MINTABLE_COLLECTIONS.length > 0,
      },
    })

  const collectionAndAccountData = useMemo(
    () => data || previousData,
    [data, previousData],
  )

  return (
    <Layout>
      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" mt={6}>
        {t('asset.typeSelector.title')}
      </Heading>
      <Text as="p" variant="text" color="gray.500" mt={3}>
        {t('asset.typeSelector.description')}
      </Text>
      <Flex
        mt={12}
        flexWrap="wrap"
        justify="center"
        align={{ base: 'center', md: 'inherit' }}
        gap={6}
      >
        {!collectionAndAccountData?.collections ? (
          <>
            <Skeleton w={64} h={344} borderRadius="2xl" />
            <Skeleton w={64} h={344} borderRadius="2xl" />
          </>
        ) : collectionAndAccountData.collections.nodes.length === 0 ? (
          <Empty
            title={t('asset.typeSelector.empty.title')}
            description={t('asset.typeSelector.empty.description')}
            icon={
              <Icon as={HiExclamationCircle} w={8} h={8} color="gray.400" />
            }
          />
        ) : (
          collectionAndAccountData.collections.nodes.map(
            ({ address, chainId, standard }) => (
              <Link
                href={`/create/${chainId}/${address}`}
                key={`${chainId}/${address}`}
              >
                <Stack
                  w={64}
                  align="center"
                  justify="center"
                  spacing={8}
                  rounded="xl"
                  border="1px"
                  borderColor="gray.200"
                  borderStyle="solid"
                  bg="white"
                  p={12}
                  shadow="sm"
                  _hover={{ shadow: 'md' }}
                  cursor="pointer"
                >
                  <Flex
                    align="center"
                    justify="center"
                    mx="auto"
                    h={36}
                    w={36}
                    rounded="full"
                    bgColor={standard === 'ERC721' ? 'blue.50' : 'green.50'}
                    color={standard === 'ERC721' ? 'blue.500' : 'green.500'}
                  >
                    {standard === 'ERC721' ? (
                      <Icon as={IoImageOutline} h={10} w={10} />
                    ) : (
                      <Icon as={IoImagesOutline} h={10} w={10} />
                    )}
                  </Flex>
                  <Box textAlign="center">
                    <Heading as="h3" variant="heading1" color="brand.black">
                      {standard === 'ERC721'
                        ? t('asset.typeSelector.single.title')
                        : t('asset.typeSelector.multiple.title')}
                    </Heading>
                    <Heading as="h5" variant="heading3" color="gray.500" mt={2}>
                      {standard === 'ERC721'
                        ? t('asset.typeSelector.single.type')
                        : t('asset.typeSelector.multiple.type')}
                    </Heading>
                  </Box>
                </Stack>
              </Link>
            ),
          )
        )}
      </Flex>
    </Layout>
  )
}

export default CreatePage
