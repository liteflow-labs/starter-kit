import {
    Heading,
    Stack,
} from '@chakra-ui/react'
import Withdraw from 'components/Withdraw/Withdraw'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Head from '../components/Head'
import useEagerConnect from '../hooks/useEagerConnect'
import SmallLayout from '../layouts/small'

const WithdrawalPage: NextPage = () => {
    useEagerConnect()
    const { t } = useTranslation('templates')

    return (
        <SmallLayout>
            <Head title="Withdrawal" />
            <Stack spacing={8}>
                <Heading variant="title">{t('withdraw.title')}</Heading>
                <Withdraw />
            </Stack>
        </SmallLayout>
    )
}

export default WithdrawalPage
