import { Button, Icon, Text, useToast } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { useInvitation } from '@liteflow/react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { HiOutlineClipboard } from '@react-icons/all-files/hi/HiOutlineClipboard'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import useAccount from '../../hooks/useAccount'
import { formatError } from '../../utils'

type Props = {
  loginUrl: string
  signer: Signer | undefined
}

const ReferralForm: FC<Props> = ({ loginUrl, signer }) => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const { isLoggedIn } = useAccount()
  const { create, creating } = useInvitation(signer)
  const { openConnectModal } = useConnectModal()
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!isLoggedIn) return // make sure the user is fully logged in
    if (url) return
    create()
      .then((id) => setUrl(`${loginUrl}?ref=${id}`))
      .catch((error) =>
        toast({
          title: formatError(error),
          status: 'error',
        }),
      )
  }, [url, create, loginUrl, toast, isLoggedIn])

  const handleClick = useCallback(() => {
    if (!url) return
    void navigator.clipboard.writeText(url)
    toast({
      title: t('referral.form.copy'),
      status: 'success',
    })
  }, [url, t, toast])

  const action = useMemo(() => {
    if (!isLoggedIn)
      return (
        <Button onClick={openConnectModal} width="full">
          <Text as="span" isTruncated>
            {t('referral.form.connect')}
          </Text>
        </Button>
      )
    return (
      <Button
        variant="outline"
        isLoading={!url || creating}
        onClick={handleClick}
        type="button"
        width="full"
        rightIcon={<Icon as={HiOutlineClipboard} h={4} w={4} ml={2} />}
      >
        <Text as="span" isTruncated>
          {url}
        </Text>
      </Button>
    )
  }, [isLoggedIn, handleClick, t, creating, url, openConnectModal])

  return action
}

export default ReferralForm
