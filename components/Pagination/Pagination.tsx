import {
  Button,
  ButtonGroup,
  Flex,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Select,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { IoChevronBackSharp } from '@react-icons/all-files/io5/IoChevronBackSharp'
import { IoChevronForward } from '@react-icons/all-files/io5/IoChevronForward'
import { JSX, useMemo } from 'react'

export type IProp = {
  limit: number
  page: number
  total?: number
  onPageChange: (page: number) => void
  result: {
    label: string
    caption: (context: {
      from: number
      to: number
      total: number
    }) => string | JSX.Element
    pages: (context: { total: number }) => string | JSX.Element
  }
  hideSelectors?: boolean
  limits?: number[]
  onLimitChange?: (limit: string) => void
}

export default function Pagination({
  limit,
  onPageChange,
  page,
  result,
  total,
  hideSelectors,
  limits,
  onLimitChange,
  ...props
}: IProp): JSX.Element {
  const isMobile = useBreakpointValue({ base: true, sm: false })
  const goTo = (newPage: number) => {
    if (!total) return
    if (page === newPage) return
    if (newPage < 1) return onPageChange(1)
    if (newPage > Math.ceil(total / limit))
      return onPageChange(Math.ceil(total / limit))
    return onPageChange(newPage)
  }

  const totalPage = useMemo(
    () => (total ? Math.ceil(total / limit) : 1),
    [limit, total],
  )
  const pages = useMemo(
    () =>
      isMobile
        ? new Array(3)
            .fill(0)
            .map((_, i) => page - 1 + i)
            .filter((x) => x > 0 && x <= totalPage)
        : new Array(5)
            .fill(0)
            .map((_, i) => page - 2 + i)
            .filter((x) => x > 0 && x <= totalPage),
    [isMobile, page, totalPage],
  )

  if (!total) return <></>
  return (
    <Flex
      direction={{ base: hideSelectors ? 'row' : 'column', md: 'row' }}
      align="center"
      justify="space-between"
      w="full"
      gap={{ base: 6, md: 3 }}
      flexWrap="wrap"
      {...props}
    >
      <Flex
        align={{ base: 'flex-start', sm: 'center' }}
        gap={6}
        w={{ base: 'full', sm: 'auto' }}
        direction={{ base: 'column', sm: 'row' }}
      >
        {!hideSelectors && (
          <Flex
            position="relative"
            direction={{
              base: 'column',
              sm: 'row',
            }}
            gap={3}
          >
            <HStack spacing={1} minWidth="max">
              <FormLabel m={0}>{result.label}</FormLabel>
            </HStack>
            <Select
              cursor="pointer"
              w="24"
              onChange={(e) => onLimitChange?.(e.target.value)}
              value={limit.toString()}
            >
              {limits?.map((limit) => (
                <option key={limit.toString()} value={limit.toString()}>
                  {limit.toString()}
                </option>
              ))}
            </Select>
          </Flex>
        )}
        <Text
          as="span"
          variant="text-sm"
          color="gray.500"
          mt={{ base: 'auto', sm: 0 }}
          w="full"
        >
          {result.caption({
            from: (page - 1) * limit + 1,
            to: Math.min((page - 1) * limit + limit, total || Infinity),
            total: total,
          })}
        </Text>
      </Flex>
      <Flex
        as="nav"
        justify="flex-end"
        flexWrap="wrap"
        flex="auto"
        gap={6}
        aria-label="Pagination"
      >
        {!hideSelectors && (
          <Flex align="center" gap={3}>
            <Text as="p" variant="text-sm" color="gray.500" w="full">
              {result.pages({ total: totalPage })}
            </Text>
          </Flex>
        )}
        <Flex align="center" flexWrap="wrap" gap={4}>
          <IconButton
            variant="outline"
            colorScheme="gray"
            rounded="full"
            size="sm"
            aria-label="previous"
            icon={
              <Icon as={IoChevronBackSharp} h={5} w={5} aria-hidden="true" />
            }
            isDisabled={page === 1}
            onClick={() => goTo(page - 1)}
          />
          <ButtonGroup>
            {pages.map((pageNumber) => (
              <Button
                key={pageNumber}
                size="sm"
                variant="outline"
                colorScheme={pageNumber === page ? 'brand' : 'gray'}
                onClick={() => goTo(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
          </ButtonGroup>
          <IconButton
            variant="outline"
            colorScheme="gray"
            rounded="full"
            size="sm"
            aria-label="next"
            icon={<Icon as={IoChevronForward} h={5} w={5} aria-hidden="true" />}
            isDisabled={page === totalPage}
            onClick={() => goTo(page + 1)}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
