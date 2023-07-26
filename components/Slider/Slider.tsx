import { Box, Flex, Icon, IconButton } from '@chakra-ui/react'
import { BiChevronLeft } from '@react-icons/all-files/bi/BiChevronLeft'
import { BiChevronRight } from '@react-icons/all-files/bi/BiChevronRight'
import useEmblaCarousel from 'embla-carousel-react'
import { FC, HTMLAttributes, useCallback, useEffect, useState } from 'react'

const Slider: FC<HTMLAttributes<any>> = ({ children }) => {
  const [viewportRef, embla] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    inViewThreshold: 1,
    containScroll: 'trimSnaps',
  })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollNext = useCallback(() => {
    embla?.scrollNext()
  }, [embla])

  const scrollPrev = useCallback(() => {
    embla?.scrollPrev()
  }, [embla])

  const onSelect = useCallback(() => {
    if (!embla) return
    setPrevBtnEnabled(embla.canScrollPrev())
    setNextBtnEnabled(embla.canScrollNext())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    onSelect()
    embla.on('select', onSelect)
  }, [embla, onSelect])

  return (
    <Box position="relative" mx="auto" w="full">
      <Box w="full" overflow="hidden" ref={viewportRef}>
        <Flex mx="-8px" w="calc(100% + 16px)" userSelect="none">
          {children}
        </Flex>
      </Box>
      <Flex
        display={prevBtnEnabled ? 'flex' : 'none'}
        position="absolute"
        top="50%"
        left={-5}
        zIndex={10}
        translateY="-50%"
        transform="auto"
      >
        <IconButton
          variant="outline"
          colorScheme="gray"
          rounded="full"
          aria-label="previous"
          icon={<Icon as={BiChevronLeft} h={6} w={6} />}
          onClick={scrollPrev}
        />
      </Flex>

      <Flex
        display={nextBtnEnabled ? 'flex' : 'none'}
        position="absolute"
        top="50%"
        right={-5}
        zIndex={10}
        translateY="-50%"
        transform="auto"
      >
        <IconButton
          variant="outline"
          colorScheme="gray"
          rounded="full"
          aria-label="next"
          icon={<Icon as={BiChevronRight} h={6} w={6} />}
          onClick={scrollNext}
        />
      </Flex>
    </Box>
  )
}

export default Slider
