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
import { useEffect, useState, VFC } from 'react'
import Image from '../Image/Image'

const TokenMedia: VFC<{
  image: string | null | undefined
  animationUrl: string | null | undefined
  unlockedContent: { url: string; mimetype: string | null } | null | undefined
  defaultText?: string
  controls?: boolean
  fill?: boolean
  sizes: string
}> = ({
  image,
  animationUrl,
  unlockedContent,
  defaultText,
  fill,
  controls,
  sizes,
}) => {
  const { colors } = useTheme()

  // prioritize unlockedContent
  if (unlockedContent) {
    if (unlockedContent.mimetype?.startsWith('video/'))
      animationUrl = unlockedContent.url
    else image = unlockedContent.url
  }

  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // reset when image change. Needed when component is recycled
  useEffect(() => setImageError(false), [image])
  useEffect(() => setVideoError(false), [image, animationUrl])

  // cannot display anything
  if (imageError && videoError)
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

  // Hack in case the image fails to load because it is a video
  if (image && imageError && !videoError) {
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
        onError={() => setVideoError(true)}
      />
    )
  }

  // display video
  if (animationUrl && !videoError) {
    return (
      <Box
        as="video"
        src={animationUrl}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        maxW="full"
        maxH="full"
        onError={() => setVideoError(true)}
      />
    )
  }

  // display image
  if (image && !imageError) {
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
          onError={() => setImageError(true)}
          layout="fill"
          objectFit={fill ? 'cover' : 'scale-down'}
          sizes={sizes}
          unoptimized={unlockedContent?.mimetype === 'image/gif'}
        />
      </Box>
    )
  }

  // nothing to display
  return (
    <svg viewBox="0 0 1 1">
      <rect width="1" height="1" fill={colors.brand[50]} />
    </svg>
  )
}

export default TokenMedia
