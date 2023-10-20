import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import useCountdown from '../../hooks/useCountdown'

type Props = {
  date: Date
  hideSeconds?: boolean
}

const Countdown: FC<Props> = ({ date, hideSeconds = false }) => {
  const { t } = useTranslation('components')
  const { diff, d, h, m, s } = useCountdown(date)

  if (diff <= 0) return null
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
