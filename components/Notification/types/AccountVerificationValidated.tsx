import { Text } from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import { JSX } from 'react'
import { AccountVerificationStatus } from '../../../graphql'

export type IProps = {
  accountVerification: {
    status: AccountVerificationStatus
    account: {
      address: string
      image: string | null
    }
  }
}

export default function AccountVerificationValidated({
  accountVerification,
}: IProps): {
  link: string
  userImage: string | null
  userAddress: string
  children: JSX.Element
} {
  return {
    link: '/create',
    userImage: accountVerification.account.image,
    userAddress: accountVerification.account.address,
    children: (
      <Trans
        ns="components"
        i18nKey="notification.account-verification-validated"
        components={[<Text as="span" fontWeight="bold" key="text" />]}
      />
    ),
  }
}
