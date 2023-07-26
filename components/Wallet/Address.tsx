import { Flex, Icon, Text, useToast } from '@chakra-ui/react'
import { HiOutlineClipboard } from '@react-icons/all-files/hi/HiOutlineClipboard'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { formatAddress } from '../../utils'

const WalletAddress: FC<{
  address: string
  isShort?: boolean
  isCopyable?: boolean
  as?: FC<any>
}> = ({ address, isShort, isCopyable, as }) => {
  const { t } = useTranslation('components')
  const formatted = formatAddress(address, 10)
  const toast = useToast()

  const handleClick = () => {
    void navigator.clipboard.writeText(address)
    toast({
      title: t('wallet.address.copy'),
      status: 'success',
    })
  }

  const children = useMemo(
    () =>
      isShort ? (
        formatted
      ) : (
        <Text as="span" isTruncated>
          {address}
        </Text>
      ),
    [address, formatted, isShort],
  )

  const CustomTag: any = as
  if (CustomTag)
    return (
      <CustomTag
        onClick={handleClick}
        postIcon={
          <Icon as={HiOutlineClipboard} ml={3} h={4} w={4} color="gray.400" />
        }
      >
        {children}
      </CustomTag>
    )

  return isCopyable ? (
    <Flex
      w="full"
      cursor="pointer"
      align="center"
      justify="center"
      onClick={handleClick}
      title={address}
    >
      {children}
      <Icon
        as={HiOutlineClipboard}
        ml={2}
        h={4}
        w={4}
        color="gray.400"
        minW="max-content"
      />
    </Flex>
  ) : (
    <>{children}</>
  )
}

export default WalletAddress
