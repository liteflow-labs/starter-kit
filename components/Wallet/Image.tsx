import Image from 'next/image'
import React, { useEffect, useRef, VFC } from 'react'

const Jazzicon = require('@metamask/jazzicon')

export const defaultSize = 32

const AccountImage: VFC<{
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
  const customTag = { Image: Image as any }
  return (
    <customTag.Image
      src={image}
      alt={address}
      width={size || defaultSize}
      height={size || defaultSize}
      {...props}
    />
  )
}

export default AccountImage
