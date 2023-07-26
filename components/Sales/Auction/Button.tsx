import { Button, Text } from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Link from '../../Link/Link'

type Props = {
  assetId: string
  isOwner: boolean
  isHomepage: boolean
  isEnded: boolean
}

// TODO: This component needs refactoring, please look at the storybook to see all the possible variants of this component with this API
const SaleAuctionButton: FC<Props> = ({
  assetId,
  isOwner,
  isHomepage,
  isEnded,
}) => {
  const { t } = useTranslation('components')
  return (
    <>
      {!isEnded && !isOwner && (
        <Button
          as={Link}
          href={`/tokens/${assetId}/bid`}
          size="lg"
          width="full"
        >
          <Text as="span" isTruncated>
            {t('sales.auction.button.place-bid')}
          </Text>
        </Button>
      )}

      {isOwner && isHomepage && (
        <Button
          as={Link}
          href={`/tokens/${assetId}`}
          variant="outline"
          colorScheme="gray"
          size="lg"
          width="full"
          rightIcon={<HiArrowNarrowRight />}
        >
          <Text as="span" isTruncated>
            {t('sales.auction.button.view')}
          </Text>
        </Button>
      )}
    </>
  )
}

export default SaleAuctionButton
