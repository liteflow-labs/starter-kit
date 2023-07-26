import { useToast } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'

export default function useHandleQueryError({
  error,
}: {
  error?: Error | undefined
}): void {
  const { t } = useTranslation('templates')
  const toast = useToast()
  useEffect(() => {
    if (!error) return
    console.error(error)
    toast({ title: t('error.500.short'), status: 'error' })
  }, [error, t, toast])
}
