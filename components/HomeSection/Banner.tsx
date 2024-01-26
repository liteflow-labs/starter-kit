import { Box, Button, Flex, Heading, VStack } from '@chakra-ui/react'
import Link from '../../components/Link/Link'
import MarkdownViewer from '../../components/MarkdownViewer'
import useEnvironment from '../../hooks/useEnvironment'
import Image from '../Image/Image'
import Slider from '../Slider/Slider'

const BannerHomeSection = () => {
  const { HOME_BANNERS } = useEnvironment()

  if (HOME_BANNERS.length === 0) return null
  return (
    <Flex as={HOME_BANNERS.length > 1 ? Slider : 'div'}>
      {HOME_BANNERS.map((banner) => (
        <Flex
          key={banner.title}
          position="relative"
          alignItems="center"
          h="500px"
          flex="0 0 100%"
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            sizes="(min-width: 80em) 1216px, 100vw"
            objectFit="cover"
          />
          <Flex
            flexDirection="column"
            alignItems="flex-start"
            gap={6}
            zIndex={1}
            px={{ base: 8, sm: 12, lg: 24 }}
            color={banner.textColor}
          >
            <VStack alignItems="flex-start" spacing={1}>
              <Heading variant="title">{banner.title}</Heading>
              {banner.content && (
                <Box>
                  <MarkdownViewer source={banner.content} noTruncate />
                </Box>
              )}
            </VStack>
            {banner.button && (
              <Button
                as={Link}
                href={banner.button.href}
                isExternal={banner.button.isExternal}
                px={{ base: 4, sm: 6, md: 16 }}
                mt={4}
              >
                {banner.button.text}
              </Button>
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

export default BannerHomeSection
