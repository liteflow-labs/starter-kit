import {
  Flex,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Select,
  Text,
} from '@chakra-ui/react'
import { IoChevronBackSharp } from '@react-icons/all-files/io5/IoChevronBackSharp'
import { IoChevronForward } from '@react-icons/all-files/io5/IoChevronForward'
import { useMemo } from 'react'

type PropWithSelector = {
  hideSelectors?: false | undefined
  limits: number[]
  onLimitChange: (limit: string) => void
}

type PropWithoutSelector = {
  hideSelectors: true
  limits?: never
  onLimitChange?: never
}

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
} & (PropWithSelector | PropWithoutSelector)

export default function Pagination({
  limit,
  onPageChange,
  page,
  result,
  total,
  ...props
}: IProp): JSX.Element {
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

  if (!total) return <></>
  return (
    <Flex
      direction={{ base: props.hideSelectors ? 'row' : 'column', md: 'row' }}
      align={{ base: 'center', sm: 'flex-start' }}
      justify={{ base: 'center', sm: 'space-between' }}
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
        {!props.hideSelectors && (
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
              onChange={(e) => props.onLimitChange(e.target.value)}
              value={limit.toString()}
            >
              {props.limits.map((limit) => (
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
        justify={{ base: 'space-between', md: 'flex-end' }}
        w={{ base: 'full', sm: 'auto' }}
        gap={6}
        aria-label="Pagination"
      >
        {!props.hideSelectors && (
          <Flex align="center" gap={3}>
            <Flex
              position="relative"
              direction={{
                base: 'column',
                sm: 'column',
              }}
            >
              <Select
                onChange={(e) => goTo(parseInt(e.target.value, 10))}
                value={page.toString()}
                cursor="pointer"
                w="24"
              >
                {Array.from({ length: totalPage }, (_, i) => i + 1).map(
                  (page) => (
                    <option key={page} value={page}>
                      {page.toString()}
                    </option>
                  ),
                )}
              </Select>
            </Flex>
            <Text as="p" variant="text-sm" color="gray.500" w="full">
              {result.pages({ total: totalPage })}
            </Text>
          </Flex>
        )}
        <Flex align="center" gap={4}>
          <IconButton
            variant="outline"
            colorScheme="gray"
            rounded="full"
            aria-label="previous"
            icon={
              <Icon as={IoChevronBackSharp} h={5} w={5} aria-hidden="true" />
            }
            isDisabled={page === 1}
            onClick={() => goTo(page - 1)}
          />
          <IconButton
            variant="outline"
            colorScheme="gray"
            rounded="full"
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
