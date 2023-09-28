import {
  Box,
  Center,
  chakra,
  Icon,
  Skeleton,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/react'
import { FaImage } from '@react-icons/all-files/fa/FaImage'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Image from '../Image/Image'

const authorizedMimetypes = ['image/', 'video/']

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
  const contentsToDisplay = useMemo<
    { url: string; mimetype?: string; fallbackMimetype?: string }[]
  >(() => {
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
          fallbackMimetype: 'image/*',
        })
        contentsToDisplay.push({
          url: unlockedContent.url,
          fallbackMimetype: 'video/*',
        })
      }
    }
    if (animationUrl) {
      contentsToDisplay.push({
        url: animationUrl,
        fallbackMimetype: 'video/*',
      })
      contentsToDisplay.push({
        url: animationUrl,
        fallbackMimetype: 'image/*',
      })
    }
    contentsToDisplay.push({
      url: imageUrl,
      fallbackMimetype: 'image/*',
    })
    contentsToDisplay.push({
      url: imageUrl,
      fallbackMimetype: 'video/*',
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

  // mimetype of the element to display
  const [mimetype, setMimetype] = useState<string | undefined>(
    toDisplay?.mimetype,
  )

  // fetch mimetype if not set
  useEffect(() => {
    // set mimetype if defined in toDisplay
    if (toDisplay?.mimetype) return setMimetype(toDisplay.mimetype)

    // reset mime type
    setMimetype(undefined)

    // check no execution cases
    if (!toDisplay) return
    if (
      !toDisplay.url.startsWith('http') ||
      !toDisplay.url.startsWith('https')
    ) {
      // do not try to fetch mime type if url is not http or https
      return
    }

    // fetch mime type
    fetch(toDisplay.url, {
      method: 'HEAD',
      // TODO: add request cancelation
    })
      .then((response) => {
        const mimetype = response.headers.get('Content-Type')
        console.log('fetched mime type', mimetype)

        // fallback to fallbackMimetype if mimetype is missing
        if (!mimetype) {
          return setMimetype(toDisplay.fallbackMimetype)
        }

        // set mimetype if it's an authorized mime type
        if (authorizedMimetypes.some((x) => mimetype.startsWith(x))) {
          return setMimetype(mimetype)
        }

        // call onError if not authorized to try to display next content
        return onError()
      })
      .catch((error) => {
        console.error(
          `error during fetch of mimetype of image ${toDisplay.url}`,
          error,
        )
        // fallback to fallbackMimetype
        setMimetype(toDisplay.fallbackMimetype)
      })
  }, [onError, toDisplay])

  // tried everything to display, return error
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
  if (mimetype?.startsWith('video/')) {
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

  // Use a image element when the file is an image
  if (mimetype?.startsWith('image/')) {
    return (
      <Box position="relative" w="full" h="full">
        <Image
          src={toDisplay.url}
          alt={defaultText}
          onError={onError}
          fill
          objectFit={fill ? 'cover' : 'contain'}
          sizes={sizes}
          unoptimized={mimetype === 'image/gif'}
        />
      </Box>
    )
  }

  // display loader
  return <Skeleton width="100%" height="100%" />
}

export default TokenMedia
