import { Flex, Icon, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { IoImagesOutline } from '@react-icons/all-files/io5/IoImagesOutline'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

const Supply: FC<{
  current: BigNumber
  total: BigNumber
  small?: boolean
}> = ({ current, total, small }) => {
  const { t } = useTranslation('components')
  return (
    <Flex align="center" py={1.5} pl={1}>
      <Icon as={IoImagesOutline} mr={2} h={4} w={4} color="gray.500" />
      {small ? (
        <Text as="span" variant="text-sm" color="gray.500">
          {current.toString()}/{total.toString()}
        </Text>
      ) : (
        <Text as="span" variant="subtitle2" color="gray.500">
          {t('token.supply.available', {
            current: current.toString(),
            total: total.toString(),
          })}
        </Text>
      )}
    </Flex>
  )
}

export default Supply
