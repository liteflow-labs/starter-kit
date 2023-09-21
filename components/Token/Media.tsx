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
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Image from '../Image/Image'

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

  // setup content to display in order with mimetype. The goal is if there is an issue with one, try the next one until no more
  const contentsToDisplay = useMemo<{ url: string; mimetype: string }[]>(() => {
    const contentsToDisplay = []
    if (unlockedContent) {
      if (unlockedContent.mimetype) {
        // we know the mimetype
        contentsToDisplay.push({
          url: unlockedContent.url,
          mimetype: unlockedContent.mimetype,
        })
      } else {
        // we don't know the mimetype, start with image and then video
        contentsToDisplay.push({
          url: unlockedContent.url,
          mimetype: 'image/*',
        })
        contentsToDisplay.push({
          url: unlockedContent.url,
          mimetype: 'video/*',
        })
      }
    }
    if (animationUrl) {
      contentsToDisplay.push({
        url: animationUrl,
        mimetype: 'video/*', // start with video
      })
      contentsToDisplay.push({
        url: animationUrl,
        mimetype: 'image/*', // then image
      })
    }
    contentsToDisplay.push({
      url: imageUrl,
      mimetype: 'image/*', // start with image
    })
    contentsToDisplay.push({
      url: imageUrl,
      mimetype: 'video/*', // then video
    })
    return contentsToDisplay
  }, [animationUrl, imageUrl, unlockedContent])
  console.log('contentsToDisplay', contentsToDisplay)

  // try to display the first element of contentsToDisplay
  const [currentContentToDisplay, setCurrentContentToDisplay] =
    useState<number>(0)

  // reset current content to display when imageUrl, animationUrl, or unlockedContent change
  useEffect(() => setCurrentContentToDisplay(0), [contentsToDisplay])

  // on error, switch to the next content to display
  const onError = useCallback(() => {
    console.warn('error onError')
    setCurrentContentToDisplay((x) => {
      console.warn('error displaying content', x)
      return x + 1 // increase current content to display by one
    })
  }, [])

  // element to display
  const toDisplay = useMemo(
    () => contentsToDisplay.at(currentContentToDisplay),
    [contentsToDisplay, currentContentToDisplay],
  )

  // nothing to display, return error
  if (!toDisplay) {
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

  // Use a basic image when the url contains a blob or data
  if (toDisplay.url.startsWith('blob:') || toDisplay.url.startsWith('data:'))
    return (
      <chakra.img
        src={toDisplay.url}
        alt={defaultText}
        objectFit={fill ? 'cover' : 'scale-down'}
        sizes={sizes}
        onError={onError}
      />
    )

  // Use a video element when the file is a video
  if (toDisplay.mimetype.startsWith('video/')) {
    return (
      <Box
        as="video"
        src={toDisplay.url}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        maxW="full"
        maxH="full"
        onError={onError}
      />
    )
  }

  // Use a image element when the file is a image
  if (toDisplay.mimetype.startsWith('image/')) {
    return (
      <Box position="relative" w="full" h="full">
        <Image
          src={toDisplay.url}
          alt={defaultText}
          onError={onError}
          fill
          objectFit={fill ? 'cover' : 'contain'}
          sizes={sizes}
          unoptimized={toDisplay.mimetype === 'image/gif'}
        />
      </Box>
    )
  }

  // TODO: should add a loading states?
}

export default TokenMedia
