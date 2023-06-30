import { FC, useEffect, useRef } from 'react'
import Image from '../Image/Image'

const Jazzicon = require('@metamask/jazzicon')

export const defaultSize = 32

const AccountImage: FC<{
  address: string
  image: string | null | undefined
  size?: number
}> = ({ image, address, size, ...props }) => {
  const ref = useRef<HTMLDivElement>()

  useEffect(() => {
    if (image) return
    if (address && ref.current) {
      ref.current.innerHTML = ''
      ref.current.appendChild(
        Jazzicon(size || defaultSize, parseInt(address.slice(2, 10), 16)),
      )
    }
  }, [image, address, size])

  if (!image) return <div ref={ref as any} {...props} />
  return (
    <Image
      src={image}
      alt={address}
      width={size || defaultSize}
      height={size || defaultSize}
      w={size ? `${size}px` : defaultSize / 4}
      h={size ? `${size}px` : defaultSize / 4}
      objectFit="cover"
      {...props}
    />
  )
}

export default AccountImage
