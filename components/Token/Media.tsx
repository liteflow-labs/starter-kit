import { Box, Center, Icon, Stack, Text, useTheme } from '@chakra-ui/react'
import { FaImage } from '@react-icons/all-files/fa/FaImage'
import { FC, useEffect, useMemo, useState } from 'react'
import { FileResult } from '../../hooks/useDetectAssetMedia'
import Image from '../Image/Image'

function useSimulateMedia(
  type: 'img' | 'video',
  src: string | undefined,
): {
  isValid: boolean
  isLoading: boolean
} {
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (!src) return
    setIsLoading(true)
    const element = document.createElement(type)
    element.src = src
    const onLoad = () => {
      setIsLoading(false)
      setIsValid(true)
      element.remove()
    }
    if (type === 'video') element.onloadedmetadata = onLoad
    if (type === 'img') element.onload = onLoad
    element.onerror = () => {
      setIsLoading(false)
      setIsValid(false)
      element.remove()
    }
    document.body.appendChild(element)
  }, [src, type])
  return {
    isValid,
    isLoading,
  }
}

const TokenMedia: FC<{
  media: FileResult
  fallback: FileResult | null
  defaultText: string
  controls?: boolean
  fill?: boolean
  sizes: string
}> = ({ media, fallback, defaultText, fill, controls, sizes }) => {
  const { colors } = useTheme()
  const [useFallback, setUseFallback] = useState(false)

  const mediaToDisplay = useMemo(
    () => (useFallback ? fallback : media),
    [useFallback, fallback, media],
  )

  const image = useSimulateMedia('img', mediaToDisplay?.url)
  const video = useSimulateMedia('video', mediaToDisplay?.url)

  const loading = useMemo(
    () => image.isLoading || video.isLoading,
    [image, video],
  )

  if (!mediaToDisplay) return null

  if (loading)
    return (
      <>
        <svg viewBox="0 0 1 1">
          <rect width="1" height="1" fill={colors.brand[100]} />
        </svg>
        <Center width="100%" height="100%" position="absolute">
          <Stack align="center" spacing={3}>
            <Text color="gray.500" fontWeight="600">
              loading
            </Text>
          </Stack>
        </Center>
      </>
    )

  // display video
  if (video.isValid) {
    return (
      <Box
        as="video"
        src={mediaToDisplay.url}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        maxW="full"
        maxH="full"
        onError={() => setUseFallback(true)}
      />
    )
  }

  if (image.isValid)
    return (
      <Box position="relative" w="full" h="full">
        <Image
          src={media.url}
          alt={defaultText}
          onError={() => setUseFallback(true)}
          fill
          objectFit={fill ? 'cover' : 'contain'}
          sizes={sizes}
          unoptimized={media.mimetype === 'image/gif'}
        />
      </Box>
    )

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
}

export default TokenMedia
