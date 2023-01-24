import { Box, Circle, Flex, Icon, IconButton } from '@chakra-ui/react'
import { BiChevronLeft } from '@react-icons/all-files/bi/BiChevronLeft'
import { BiChevronRight } from '@react-icons/all-files/bi/BiChevronRight'
import useEmblaCarousel from 'embla-carousel-react'
import React, {
  FC,
  HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react'

type Props = {
  showNavigation?: boolean
}

const Slider: FC<Props & HTMLAttributes<any>> = ({
  showNavigation = false,
  children,
}) => {
  const [viewportRef, embla] = useEmblaCarousel({
    align: 'start',
    speed: 5,
    slidesToScroll: 1,
    inViewThreshold: 1,
    containScroll: 'trimSnaps',
  })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const [activeSlide, setActiveSlide] = useState(0)
  const slides = Array(React.Children.count(children)).fill({})

  const scrollNext = useCallback(() => {
    embla?.scrollNext()
    setActiveSlide((curr) => curr + 1)
  }, [embla])

  const scrollPrev = useCallback(() => {
    embla?.scrollPrev()
    setActiveSlide((curr) => curr - 1)
  }, [embla])

  const scrollTo = useCallback(
    (slide: number) => {
      embla?.scrollTo(slide)
      setActiveSlide(slide)
    },
    [embla],
  )

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
        <Flex mx="-10px" w="calc(100%+20px)" userSelect="none">
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

      {showNavigation && (
        <Flex justify="center" gap={3}>
          {slides.map((_, index) => (
            <Circle
              key={'slides_' + index}
              size={3}
              backgroundColor={activeSlide === index ? 'black' : 'gray.300'}
              onClick={() => scrollTo(index)}
              cursor={activeSlide === index ? 'default' : 'pointer'}
            />
          ))}
        </Flex>
      )}
    </Box>
  )
}

export default Slider
