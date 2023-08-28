import {
  Box,
  Center,
  chakra,
  Icon,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/react'
import { FaImage } from '@react-icons/all-files/fa/FaImage'
import { FC, useCallback, useEffect, useState } from 'react'
import Image from '../Image/Image'

const getUnlockedContentUrls = (
  unlockedContent:
    | {
        url: string
        mimetype: string | null
      }
    | null
    | undefined,
  imageUrl: string,
  animationUrl: string | null | undefined,
): { image: string; animation: string | null } => {
  if (unlockedContent) {
    return {
      image: unlockedContent.url,
      animation: unlockedContent.mimetype?.startsWith('video/')
        ? unlockedContent.url
        : null,
    }
  }
  return {
    image: imageUrl,
    animation: animationUrl || null,
  }
}

const TokenMedia: FC<{
  imageUrl: string
  animationUrl: string | null | undefined
  unlockedContent: { url: string; mimetype: string | null } | null | undefined
  defaultText: string
  controls?: boolean
  fill?: boolean
  sizes: string
}> = ({
  imageUrl,
  animationUrl,
  unlockedContent,
  defaultText,
  fill,
  controls,
  sizes,
}) => {
  const { colors } = useTheme()

  // prioritize unlockedContent
  const { image, animation } = getUnlockedContentUrls(
    unlockedContent,
    imageUrl,
    animationUrl,
  )

  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const onImageError = useCallback(() => setImageError(true), [])
  const onVideoError = useCallback(() => setVideoError(true), [])

  // reset when image change. Needed when component is recycled
  useEffect(() => setImageError(false), [image])
  useEffect(() => setVideoError(false), [image, animation])

  // cannot display anything
  if (imageError && videoError)
    return (
      <>
        <svg viewBox="0 0 1 1">
          <rect width="1" height="1" fill={colors.brand[100]} />
        </svg>
        <Center width="100%" height="100%" position="absolute">
          <Stack align="center" spacing={3}>
            <Icon as={FaImage} color="gray.500" boxSize="4em" />
            <Text color="gray.500" fontWeight="600">
              An issue occurred
            </Text>
          </Stack>
        </Center>
      </>
    )

  // Hack in case the image fails to load because it is a video
  if (imageError && !videoError) {
    return (
      <Box
        as="video"
        src={image}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        maxW="full"
        maxH="full"
        onError={onVideoError}
      />
    )
  }

  // display video
  if (animation && !videoError) {
    return (
      <Box
        as="video"
        src={animation}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        maxW="full"
        maxH="full"
        onError={onVideoError}
      />
    )
  }

  // Use a basic image when the file is a blob or data
  if (image.startsWith('blob:') || image.startsWith('data:'))
    return (
      <chakra.img
        src={image}
        alt={defaultText}
        objectFit={fill ? 'cover' : 'scale-down'}
        sizes={sizes}
      />
    )

  return (
    <Box position="relative" w="full" h="full">
      <Image
        src={image}
        alt={defaultText}
        onError={onImageError}
        fill
        objectFit={fill ? 'cover' : 'contain'}
        sizes={sizes}
        unoptimized={unlockedContent?.mimetype === 'image/gif'}
      />
    </Box>
  )
}

export default TokenMedia
