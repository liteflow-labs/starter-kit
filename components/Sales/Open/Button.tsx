import { Button, Icon, Text } from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import React, { VFC } from 'react'
import Link from '../../Link/Link'

type Props = {
  assetId: string
  isHomepage: boolean
  ownAllSupply: boolean
}

const SaleOpenButton: VFC<Props> = ({ assetId, isHomepage, ownAllSupply }) => {
  const { t } = useTranslation('components')

  if (ownAllSupply && isHomepage)
    return (
      <Button
        as={Link}
        href={`/tokens/${assetId}`}
        variant="outline"
        colorScheme="gray"
        bgColor="white"
        size="lg"
        rightIcon={<Icon as={HiArrowNarrowRight} />}
        isFullWidth
      >
        <Text as="span" isTruncated>
          {t('sales.open.button.view')}
        </Text>
      </Button>
    )

  if (ownAllSupply) return null

  return (
    <Button as={Link} href={`/tokens/${assetId}/bid`} size="lg" isFullWidth>
      <Text as="span" isTruncated>
        {t('sales.open.button.place-bid')}
      </Text>
    </Button>
  )
}

export default SaleOpenButton
