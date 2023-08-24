import { Box, Flex, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo, useState } from 'react'

const refreshRate = 1000

type Props = {
  date: Date
  hideSeconds?: boolean
  isStyled?: boolean
}

const Countdown: FC<Props> = ({ date, hideSeconds = false, isStyled }) => {
  const { t } = useTranslation('components')
  const [diff, setDiff] = useState(+new Date(date) - +new Date())
  const d = useMemo(() => Math.floor(diff / (1000 * 60 * 60 * 24)), [diff])
  const h = useMemo(() => Math.floor((diff / (1000 * 60 * 60)) % 24), [diff])
  const m = useMemo(() => Math.floor((diff / 1000 / 60) % 60), [diff])
  const s = useMemo(() => Math.floor((diff / 1000) % 60), [diff])

  useEffect(() => {
    const timer = setInterval(() => {
      const newDiff = +new Date(date) - +new Date()
      setDiff(newDiff <= 0 ? 0 : newDiff)
    }, refreshRate)
    return () => clearInterval(timer)
  }, [date])

  if (diff <= 0) return null

  if (isStyled) {
    const boxStyle = {
      w: 10,
      py: 0.5,
      bg: 'rgba(107, 114, 128, 0.5)',
      backdropFilter: 'blur(16px)',
      rounded: 'lg',
      textAlign: 'center' as any,
    }
    return (
      <Flex gap={2}>
        {d > 0 && (
          <Box {...boxStyle}>
            <Text variant="subtitle2">{d}</Text>
            <Text variant="caption">{t('countdown.day-long')}</Text>
          </Box>
        )}
        <Box {...boxStyle}>
          <Text variant="subtitle2">{`0${h}`.slice(-2)}</Text>
          <Text variant="caption">{t('countdown.hour-long')}</Text>
        </Box>
        <Box {...boxStyle}>
          <Text variant="subtitle2">{`0${m}`.slice(-2)}</Text>
          <Text variant="caption">{t('countdown.min-long')}</Text>
        </Box>
        <Box {...boxStyle}>
          <Text variant="subtitle2">{`0${s}`.slice(-2)}</Text>
          <Text variant="caption">{t('countdown.sec-long')}</Text>
        </Box>
      </Flex>
    )
  }

  return (
    <span>
      {d > 0 && <span>{t('countdown.day', { value: d })}</span>}{' '}
      <span>{t('countdown.hour', { value: `0${h}`.slice(-2) })}</span>{' '}
      <span>{t('countdown.min', { value: `0${m}`.slice(-2) })}</span>{' '}
      {!hideSeconds && (
        <span>{t('countdown.sec', { value: `0${s}`.slice(-2) })}</span>
      )}
    </span>
  )
}

export default Countdown
