import { Box, Flex, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, HTMLAttributes, useEffect, useMemo, useState } from 'react'

const refreshRate = 1000

const Countdown: FC<
  HTMLAttributes<any> & {
    date: Date
    hideSeconds?: boolean
    isStyled?: boolean
  }
> = ({ date, hideSeconds = false, isStyled, ...props }) => {
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
            <Text variant="caption">days</Text>
          </Box>
        )}
        <Box {...boxStyle}>
          <Text variant="subtitle2">{`0${h}`.slice(-2)}</Text>
          <Text variant="caption">hrs</Text>
        </Box>
        <Box {...boxStyle}>
          <Text variant="subtitle2">{`0${m}`.slice(-2)}</Text>
          <Text variant="caption">mins</Text>
        </Box>
        <Box {...boxStyle}>
          <Text variant="subtitle2">{`0${s}`.slice(-2)}</Text>
          <Text variant="caption">secs</Text>
        </Box>
      </Flex>
    )
  }

  return (
    <div {...props}>
      {d > 0 && <span>{t('countdown.day', { value: d })}</span>}{' '}
      <span>{t('countdown.hour', { value: `0${h}`.slice(-2) })}</span>{' '}
      <span>{t('countdown.min', { value: `0${m}`.slice(-2) })}</span>{' '}
      {!hideSeconds && (
        <span>{t('countdown.sec', { value: `0${s}`.slice(-2) })}</span>
      )}
    </div>
  )
}

export default Countdown
