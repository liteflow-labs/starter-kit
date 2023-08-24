import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import { FC, JSX } from 'react'
import Link from '../Link/Link'
import SkeletonGrid from '../Skeleton/Grid'
import SkeletonTokenCard from '../Skeleton/TokenCard'
import Slider from '../Slider/Slider'

type Props = {
  explore?: {
    title: string
    href: string
  }
  items: Array<any> | undefined
  itemRender: (item: any) => JSX.Element
  title: string
}

const ITEM_PER_LINE = 4

const HomeGridSection: FC<Props> = ({ explore, items, itemRender, title }) => {
  if (!items)
    return (
      <Stack spacing={6}>
        <Skeleton noOfLines={1} height={8} width={200} />
        <SkeletonGrid items={ITEM_PER_LINE} columns={{ base: 1, sm: 2, lg: 4 }}>
          <SkeletonTokenCard />
        </SkeletonGrid>
      </Stack>
    )
  if (items.length === 0) return null
  return (
    <Stack spacing={6}>
      <Flex flexWrap="wrap" align="center" justify="space-between" gap={4}>
        <Heading as="h2" variant="subtitle" color="brand.black">
          {title}
        </Heading>
        {explore && (
          <Link href={explore.href}>
            <Button
              variant="outline"
              colorScheme="gray"
              rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
              iconSpacing="10px"
            >
              <Text as="span" isTruncated>
                {explore.title}
              </Text>
            </Button>
          </Link>
        )}
      </Flex>
      {items.length > ITEM_PER_LINE ? (
        <Slider>
          {items.map((item, i) => (
            <Flex
              key={i}
              grow={0}
              shrink={0}
              basis={{
                base: '80%',
                md: '50%',
                lg: '25%',
              }}
              p="8px"
              overflow="hidden"
            >
              {itemRender(item)}
            </Flex>
          ))}
        </Slider>
      ) : (
        <SimpleGrid flexWrap="wrap" spacing={4} columns={{ sm: 2, lg: 4 }}>
          {items.map((item, i) => (
            <Flex key={i} justify="center" overflow="hidden">
              {itemRender(item)}
            </Flex>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

export default HomeGridSection
