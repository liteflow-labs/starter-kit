import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import conectors from '../../../connectors'

type Props = {
  activate: (
    connector: AbstractConnector,
    onError?: ((error: Error) => void) | undefined,
    throwErrors?: boolean | undefined,
  ) => Promise<void>
}

type FormData = {
  email: string
}

const WalletEmail: FC<Props> = ({ activate }) => {
  const { t } = useTranslation('components')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const handle = handleSubmit(async (data) => {
    invariant(conectors.email, 'Email connector not found')
    await activate(conectors.email.withEmail(data.email), undefined, true)
  })

  return (
    <Stack as="form" spacing={6} onSubmit={handle}>
      <FormControl isInvalid={!!errors.email}>
        <FormLabel htmlFor="email">
          {t('wallet.connectors.email.form.email.label')}
        </FormLabel>
        <Input
          id="email"
          type="email"
          placeholder={t('user.form.edit.email.placeholder')}
          {...register('email', {
            required: t('wallet.connectors.email.form.validation.required'),
            pattern: {
              value: /^[\w%+.-]+@[\d.a-z-]+\.[a-z]{2,}$/i,
              message: t('wallet.connectors.email.form.validation.invalid'),
            },
          })}
        />
        {errors.email && (
          <FormErrorMessage>{errors.email.message}</FormErrorMessage>
        )}
      </FormControl>
      <Button isLoading={isSubmitting} size="lg" type="submit" isFullWidth>
        <Text as="span" isTruncated>
          {t('wallet.connectors.email.form.submit')}
        </Text>
      </Button>
    </Stack>
  )
}
export default WalletEmail
