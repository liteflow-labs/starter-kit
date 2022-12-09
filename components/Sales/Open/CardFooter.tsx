import { Flex, Tag, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import React, { FC, HTMLAttributes } from 'react'
import Link from '../../Link/Link'

type Props = {
  href: string
}

const SaleOpenCardFooter: FC<HTMLAttributes<any> & Props> = ({
  href,
  ...props
}) => {
  const { t } = useTranslation('components')
  return (
    <div {...props}>
      <Tag
        size="lg"
        variant="outline"
        borderRadius="full"
        boxShadow="none"
        border="1px"
        borderColor="gray.200"
      >
        <Text as="span" variant="text-sm" color="brand.black">
          {t('sales.open.card-footer.open')}
        </Text>
      </Tag>
      <Flex
        as={Link}
        color="brand.500"
        mt={3.5}
        w="full"
        justify="space-between"
        fontSize="sm"
        fontWeight="semibold"
        href={href}
      >
        {t('sales.open.card-footer.place-bid')}
      </Flex>
    </div>
  )
}

export default SaleOpenCardFooter
