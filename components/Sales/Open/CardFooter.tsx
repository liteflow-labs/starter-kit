import { Box, Flex } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, HTMLAttributes } from 'react'
import Link from '../../Link/Link'

type Props = {
  href: string
  isOwner: boolean
  showButton?: boolean
}

const SaleOpenCardFooter: FC<HTMLAttributes<any> & Props> = ({
  href,
  isOwner,
  showButton = true,
  ...props
}) => {
  const { t } = useTranslation('components')
  return (
    <Box {...props}>
      <Flex
        as={Link}
        color={showButton ? 'white' : 'gray.500'}
        bgColor={showButton ? 'brand.500' : 'gray.100'}
        py={2}
        px={4}
        fontSize="sm"
        fontWeight="semibold"
        href={href}
      >
        {showButton
          ? isOwner
            ? t('sales.open.card-footer.view')
            : t('sales.open.card-footer.place-bid')
          : t('sales.open.card-footer.open')}
      </Flex>
    </Box>
  )
}

export default SaleOpenCardFooter
