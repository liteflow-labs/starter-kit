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
import { IoImageOutline } from '@react-icons/all-files/io5/IoImageOutline'
import { IoImagesOutline } from '@react-icons/all-files/io5/IoImagesOutline'
import { useWeb3React } from '@web3-react/core'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React from 'react'
import Head from '../../components/Head'
import Link from '../../components/Link/Link'
import BackButton from '../../components/Navbar/BackButton'
import environment from '../../environment'
import {
  FetchAccountVerificationStatusDocument,
  FetchAccountVerificationStatusQuery,
  FetchAccountVerificationStatusQueryVariables,
  useFetchAccountVerificationStatusQuery,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import SmallLayout from '../../layouts/small'
import { wrapServerSideProps } from '../../props'

export const getServerSideProps = wrapServerSideProps(
  environment.GRAPHQL_URL,
  async (context, client) => {
    const { data, error } = await client.query<
      FetchAccountVerificationStatusQuery,
      FetchAccountVerificationStatusQueryVariables
    >({
      query: FetchAccountVerificationStatusDocument,
      variables: {
        account: context.user.address || '',
      },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {},
    }
  },
)

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
  const ready = useEagerConnect()
  const { t } = useTranslation('templates')
  const { back } = useRouter()
  const { account } = useWeb3React()
  const { data } = useFetchAccountVerificationStatusQuery({
    variables: {
      account: account?.toLowerCase() || '',
    },
    skip: !ready,
  })

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
        <Link href="/create/single">
          <Stack
            as="a"
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
              bgColor="blue.50"
              color="blue.500"
            >
              <Icon as={IoImageOutline} h={10} w={10} />
            </Flex>
            <Box textAlign="center">
              <Heading as="h3" variant="heading1" color="brand.black">
                {t('asset.typeSelector.single.title')}
              </Heading>
              <Heading as="h5" variant="heading3" color="gray.500" mt={2}>
                {t('asset.typeSelector.single.type')}
              </Heading>
            </Box>
          </Stack>
        </Link>
        <Link href="/create/multiple">
          <Stack
            as="a"
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
              bg="green.50"
              color="green.500"
            >
              <Icon as={IoImagesOutline} w={10} h={10} />
            </Flex>
            <Box textAlign="center">
              <Heading as="h3" variant="heading1" color="brand.black">
                {t('asset.typeSelector.multiple.title')}
              </Heading>
              <Heading as="h5" variant="heading3" color="gray.500" mt={2}>
                {t('asset.typeSelector.multiple.type')}
              </Heading>
            </Box>
          </Stack>
        </Link>
      </Flex>
    </Layout>
  )
}

export default CreatePage
