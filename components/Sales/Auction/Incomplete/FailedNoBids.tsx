import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Heading,
  Stack,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

type Props = {
  // TODO: Remove props as it is used only to put a margin, this margin should be handled in one of the parent component
  isOwner: boolean
}

const SaleAuctionIncompleteNoBids: FC<Props> = ({ isOwner }) => {
  const { t } = useTranslation('components')
  return (
    <Stack spacing={8}>
      <hr />
      <Heading as="h2" variant="subtitle" color="brand.black">
        {t('sales.auction.failed-no-bid.ended')}
      </Heading>
      <Stack spacing={3}>
        <Heading as="h5" variant="heading3" color="gray.500">
          {t('sales.auction.failed-no-bid.highest-bid')}
        </Heading>
        <Heading as="h4" variant="heading2" color="brand.black">
          {t('sales.auction.failed-no-bid.no-bids')}
        </Heading>
      </Stack>

      <Alert
        status="error"
        mb={isOwner ? '-20px !important' : 0}
        borderRadius="xl"
      >
        <AlertIcon />
        <Box fontSize="sm">
          <AlertTitle>
            {t('sales.auction.failed-no-bid.banner.title')}
          </AlertTitle>
          <AlertDescription>
            {t('sales.auction.failed-no-bid.banner.description')}
          </AlertDescription>
        </Box>
      </Alert>
    </Stack>
  )
}

export default SaleAuctionIncompleteNoBids
