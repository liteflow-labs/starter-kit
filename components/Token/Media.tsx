import { Box, Center, Icon, Stack, Text, useTheme } from '@chakra-ui/react'
import { FaImage } from '@react-icons/all-files/fa/FaImage'
import Image, { ImageProps } from 'next/image'
import { useEffect, useState, VFC, VideoHTMLAttributes } from 'react'

const TokenMedia: VFC<
  (Omit<VideoHTMLAttributes<any>, 'src'> | Omit<ImageProps, 'src'>) & {
    image: string | null | undefined
    animationUrl: string | null | undefined
    unlockedContent: { url: string; mimetype: string | null } | null | undefined
    defaultText?: string
    controls?: boolean | undefined
    layout?: string | undefined
  }
> = ({
  image,
  animationUrl,
  unlockedContent,
  defaultText,
  layout,
  controls,
  ...props
}) => {
  const { colors } = useTheme()
  // prioritize unlockedContent
  if (unlockedContent) {
    if (unlockedContent.mimetype?.startsWith('video/'))
      animationUrl = unlockedContent.url
    else image = unlockedContent.url
  }

  const [imageError, setImageError] = useState(false)
  // reset when image change. Needed when component is recycled
  useEffect(() => {
    setImageError(false)
  }, [image])

  if (animationUrl) {
    const { objectFit, src, ...videoProps } = props as ImageProps
    return (
      <video
        src={animationUrl}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        {...(videoProps as Omit<VideoHTMLAttributes<any>, 'src'>)}
      />
    )
  }
  if (image) {
    const rest = props as Omit<ImageProps, 'src'>
    if (imageError)
      return (
        <>
          <svg viewBox="0 0 1 1">
            <rect width="1" height="1" fill={colors.brand[100]} />
          </svg>
          <Center width="100%" height="100%" position="absolute">
            <Stack align="center" spacing={3}>
              <Icon as={FaImage} color="gray.500" w="5em" h="4em" />
              <Text color="gray.500" fontWeight="600">
                An issue occurred
              </Text>
            </Stack>
          </Center>
        </>
      )

    const customTag = { Image: Image as any }
    return (
      <Box position="relative" w="full" pt="100%">
        <customTag.Image
          src={image}
          alt={defaultText}
          onError={() => setImageError(true)}
          layout={layout}
          {...rest}
        />
      </Box>
    )
  }
  return (
    <svg viewBox="0 0 1 1">
      <rect width="1" height="1" fill={colors.brand[50]} />
    </svg>
  )
}

export default TokenMedia
