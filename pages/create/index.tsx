import {
  Alert,
  AlertIcon,
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiExclamationCircle } from '@react-icons/all-files/hi/HiExclamationCircle'
import { IoImageOutline } from '@react-icons/all-files/io5/IoImageOutline'
import { IoImagesOutline } from '@react-icons/all-files/io5/IoImagesOutline'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React from 'react'
import Empty from '../../components/Empty/Empty'
import Head from '../../components/Head'
import Link from '../../components/Link/Link'
import Loader from '../../components/Loader'
import BackButton from '../../components/Navbar/BackButton'
import environment from '../../environment'
import {
  CollectionFilter,
  useFetchCollectionsAndAccountVerificationStatusQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useEagerConnect from '../../hooks/useEagerConnect'
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
  useEagerConnect()
  const { t } = useTranslation('templates')
  const { back } = useRouter()
  const { address } = useAccount()
  const { data, called, loading } =
    useFetchCollectionsAndAccountVerificationStatusQuery({
      variables: {
        account: address || '',
        collectionFilter: collectionsFilter,
        fetchCollections: environment.MINTABLE_COLLECTIONS.length > 0,
      },
    })

  if (loading) return <Loader fullPage />

  if (
    environment.RESTRICT_TO_VERIFIED_ACCOUNT &&
    data?.account?.verification?.status !== 'VALIDATED'
  )
    return (
      <Layout>
        <BackButton onClick={back} />
        <Heading as="h1" variant="title" color="brand.black" mt={6} mb={12}>
          {t('asset.typeSelector.title')}
        </Heading>
        <Stack align="center" spacing={6} mb={40}>
          <Center bgColor="brand.50" w={12} h={12} rounded="full">
            <Icon as={HiBadgeCheck} color="brand.500" w={6} h={6} />
          </Center>
          <Stack textAlign="center">
            <Heading variant="heading1">{t('asset.restricted.title')}</Heading>
            <Text pb={2} color="gray.500">
              <Trans
                ns="templates"
                i18nKey="asset.restricted.description"
                components={[
                  <Link
                    fontWeight="bold"
                    href={`mailto:${environment.REPORT_EMAIL}`}
                    key="report"
                  >
                    {environment.REPORT_EMAIL}
                  </Link>,
                ]}
              />
            </Text>
          </Stack>
          <Alert
            status="info"
            rounded="xl"
            borderWidth="1px"
            borderColor="blue.300"
          >
            <AlertIcon />
            <Text variant="subtitle2">{t('asset.restricted.info')}</Text>
          </Alert>
        </Stack>
      </Layout>
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
        {data?.collections?.nodes.map(({ address, chainId, standard }) => (
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
        ))}
        {called && !data?.collections && (
          <Empty
            title={t('asset.typeSelector.empty.title')}
            description={t('asset.typeSelector.empty.description')}
            icon={
              <Icon as={HiExclamationCircle} w={8} h={8} color="gray.400" />
            }
          />
        )}
      </Flex>
    </Layout>
  )
}

export default CreatePage
