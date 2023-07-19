import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react'
import { BiBadgeCheck } from '@react-icons/all-files/bi/BiBadgeCheck'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { FC } from 'react'

type Props = {
  assetId: string
  isOwner: boolean
  isHomepage: boolean
}

const SaleOpenInfo: FC<Props> = ({ assetId, isOwner, isHomepage }) => {
  const { t } = useTranslation('components')
  if (!isOwner) return null
  if (isHomepage) return null

  return (
    <Link href={`/tokens/${assetId}/offer`} passHref>
      <Flex
        gap={6}
        align={{
          base: 'flex-start',
          sm: 'center',
          md: 'flex-start',
          lg: 'center',
        }}
        justify="space-between"
        rounded="xl"
        bg="green.50"
        p={6}
        cursor="pointer"
        direction={{ base: 'column', sm: 'row', md: 'column', lg: 'row' }}
      >
        <Flex align="center" gap={5}>
          <Box>
            <Flex
              align="center"
              justify="center"
              rounded="lg"
              bg="green.500"
              h={8}
              w={8}
            >
              <Icon as={BiBadgeCheck} h={6} w={6} color="white" />
            </Flex>
          </Box>
          <Heading as="h4" variant="heading2" color="brand.black">
            {t('sales.open.info.owner')}
          </Heading>
        </Flex>

        <div>
          <Button
            variant="outline"
            colorScheme="gray"
            bgColor="white"
            rightIcon={<Icon as={HiArrowNarrowRight} />}
          >
            <Text as="span" isTruncated>
              {t('sales.open.info.sell')}
            </Text>
          </Button>
        </div>
      </Flex>
    </Link>
  )
}

export default SaleOpenInfo
