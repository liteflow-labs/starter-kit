import { Button, Text } from '@chakra-ui/react'
import { HiOutlineArrowLeft } from '@react-icons/all-files/hi/HiOutlineArrowLeft'
import useTranslation from 'next-translate/useTranslation'
import React, { FC, HTMLAttributes } from 'react'

type IProps = HTMLAttributes<any> & {
  onClick: () => void
}

const BackButton: FC<IProps> = ({ children, onClick, ...props }) => {
  const { t } = useTranslation('components')
  return (
    <Button
      variant="outline"
      colorScheme="gray"
      onClick={onClick}
      leftIcon={<HiOutlineArrowLeft />}
      {...props}
    >
      <Text as="span" isTruncated>
        {children ? children : t('back')}{' '}
      </Text>
    </Button>
  )
}

export default BackButton
