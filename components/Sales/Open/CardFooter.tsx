import { Flex, Stack, Text } from '@chakra-ui/react'
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
    <Stack spacing={4} {...props}>
      <Text as="span" variant="subtitle2" color="gray.500" px={4}>
        {t('sales.open.card-footer.open')}
      </Text>
      <Flex
        as={Link}
        color="white"
        bgColor="brand.500"
        py={2}
        px={4}
        fontSize="sm"
        fontWeight="semibold"
        href={href}
        visibility={showButton ? 'visible' : 'hidden'}
      >
        {isOwner
          ? t('sales.open.card-footer.view')
          : t('sales.open.card-footer.place-bid')}
      </Flex>
    </Stack>
  )
}

export default SaleOpenCardFooter
