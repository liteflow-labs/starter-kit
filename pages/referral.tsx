import {
  Box,
  Flex,
  Heading,
  Icon,
  ListItem,
  OrderedList,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { AiFillInfoCircle } from '@react-icons/all-files/ai/AiFillInfoCircle'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Head from '../components/Head'
import ReferralForm from '../components/Referral/Form'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import useSigner from '../hooks/useSigner'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const percentage = {
    base: environment.REFERRAL_PERCENTAGE.base,
    secondary: environment.REFERRAL_PERCENTAGE.secondary,
  }
  const loginUrl = environment.BASE_URL + '/login'
  const platformName = 'Acme'
  return (
    <SmallLayout>
      <Head title="Referral" />
      <Stack spacing={8}>
        <Heading variant="title">{t('referral.title')}</Heading>
        <Text>{t('referral.description', { platformName })}</Text>

        <div>
          <Heading variant="subtitle" pb={4}>
            {t('referral.link')}
          </Heading>
          <ReferralForm loginUrl={loginUrl} signer={signer} />
        </div>

        <div>
          <Heading variant="subtitle" pb={4}>
            {t('referral.how.title')}
          </Heading>
          <OrderedList>
            <ListItem>
              <Text>{t('referral.how.steps.0')}</Text>
            </ListItem>
            <ListItem>
              <Text>{t('referral.how.steps.1')}</Text>
            </ListItem>
            <ListItem>
              <Text>{t('referral.how.steps.2')}</Text>
            </ListItem>
            <ListItem>
              <Text>{t('referral.how.steps.3')}</Text>
            </ListItem>
          </OrderedList>
        </div>

        <div>
          <Heading variant="subtitle" pb={4}>
            {t('referral.rewards.title')}
          </Heading>
          <SimpleGrid columns={{ sm: percentage.secondary ? 2 : 1 }}>
            <Box pb={4}>
              {!!percentage.secondary && (
                <Flex as={Text} pb={4} fontWeight="bold" align="center" gap={2}>
                  {t('referral.rewards.primary.title')}
                  <Tooltip
                    cursor="pointer"
                    label={t('referral.rewards.primary.tooltip')}
                  >
                    <span>
                      <Icon as={AiFillInfoCircle} color="gray.500" />
                    </span>
                  </Tooltip>
                </Flex>
              )}
              <Text>
                {t('referral.rewards.primary.description', {
                  percentage: percentage.base,
                })}
              </Text>
            </Box>
            {percentage.secondary && (
              <Box pb={4}>
                <Flex as={Text} pb={4} fontWeight="bold" align="center" gap={2}>
                  {t('referral.rewards.secondary.title')}
                  <Tooltip
                    cursor="pointer"
                    label={t('referral.rewards.secondary.tooltip')}
                  >
                    <span>
                      <Icon as={AiFillInfoCircle} color="gray.500" />
                    </span>
                  </Tooltip>
                </Flex>
                <Text>
                  {t('referral.rewards.secondary.description', {
                    percentage: percentage.secondary,
                  })}
                </Text>
              </Box>
            )}
          </SimpleGrid>
        </div>
      </Stack>
    </SmallLayout>
  )
}

export default LoginPage
