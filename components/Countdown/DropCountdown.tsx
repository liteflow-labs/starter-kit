import { Box, Flex, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect } from 'react'
import useCountdown from '../../hooks/useCountdown'

type Props = {
  date: Date
  isHidden?: boolean
  onCountdownEnd?: () => void
}

const DropCountdown: FC<Props> = ({ date, isHidden, onCountdownEnd }) => {
  const { t } = useTranslation('components')
  const { diff, d, h, m, s } = useCountdown(date)

  useEffect(() => {
    if (diff <= 0) {
      onCountdownEnd?.()
    }
  }, [diff, onCountdownEnd])

  const boxStyle = {
    w: 10,
    py: 0.5,
    background: 'rgba(107, 114, 128, 0.5)',
    color: 'white',
    rounded: 'lg',
    textAlign: 'center' as any,
  }

  if (diff <= 0) return null
  return (
    <Flex display={isHidden ? 'none' : 'flex'} gap={2}>
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

export default DropCountdown
