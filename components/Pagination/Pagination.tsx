import {
  Button,
  ButtonGroup,
  Flex,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Select,
  Skeleton,
} from '@chakra-ui/react'
import { IoChevronBackSharp } from '@react-icons/all-files/io5/IoChevronBackSharp'
import { IoChevronForward } from '@react-icons/all-files/io5/IoChevronForward'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { JSX } from 'react'
import Link from '../Link/Link'

export type IProp = {
  page: number
  hasNextPage: boolean | undefined
  hasPreviousPage: boolean | undefined
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: string) => void
  withoutLimit?: boolean
  withoutNumbers?: boolean
  limit?: number
  limits?: number[]
}

export default function Pagination({
  page,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onLimitChange,
  limit,
  limits,
  withoutLimit,
  withoutNumbers,
  ...props
}: IProp): JSX.Element {
  const { t } = useTranslation('components')
  const { pathname, query } = useRouter()

  if (hasPreviousPage === undefined || hasNextPage === undefined)
    return (
      <Flex align={{ base: 'flex-end', sm: 'center' }} justify="space-between">
        <Skeleton w={3 / 8} h={10} />
        <Skeleton w={2 / 8} h={8} />
      </Flex>
    )

  return (
    <Flex
      direction={{ base: withoutLimit ? 'row' : 'column', sm: 'row' }}
      align={{ base: 'flex-end', sm: 'center' }}
      justify="space-between"
      w="full"
      gap={{ base: 6, sm: 3 }}
      flexWrap="wrap"
      {...props}
    >
      {!withoutLimit && limit && limits && onLimitChange && (
        <Flex gap={3} display={{ base: 'none', sm: 'flex' }}>
          <HStack spacing={1} minWidth="max">
            <FormLabel m={0}>{t('pagination.label')}</FormLabel>
          </HStack>
          <Select
            cursor="pointer"
            w="24"
            onChange={(e) => onLimitChange(e.target.value)}
            value={limit.toString()}
          >
            {limits.map((limit) => (
              <option key={limit.toString()} value={limit.toString()}>
                {limit.toString()}
              </option>
            ))}
          </Select>
        </Flex>
      )}
      <Flex
        as="nav"
        aria-label="Pagination"
        justify="flex-end"
        flex="auto"
        gap={4}
      >
        <IconButton
          as={onPageChange ? undefined : Link}
          href={
            onPageChange
              ? undefined
              : { pathname, query: { ...query, page: page - 1 } }
          }
          variant="outline"
          colorScheme="gray"
          rounded="full"
          size="sm"
          aria-label="previous"
          icon={<Icon as={IoChevronBackSharp} h={4} w={4} aria-hidden="true" />}
          isDisabled={!hasPreviousPage}
          pointerEvents={hasPreviousPage ? undefined : 'none'}
          onClick={onPageChange ? () => onPageChange(page - 1) : undefined}
        />
        {!withoutNumbers && (
          <ButtonGroup>
            {hasPreviousPage && (
              <Button
                as={onPageChange ? undefined : Link}
                href={
                  onPageChange
                    ? undefined
                    : { pathname, query: { ...query, page: page - 1 } }
                }
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={
                  onPageChange ? () => onPageChange(page - 1) : undefined
                }
              >
                {page - 1}
              </Button>
            )}
            <Button
              as={onPageChange ? undefined : Link}
              href={onPageChange ? undefined : { pathname, query }}
              size="sm"
              variant="outline"
              colorScheme="brand"
              onClick={onPageChange ? () => onPageChange(page) : undefined}
            >
              {page}
            </Button>
            {hasNextPage && (
              <Button
                as={onPageChange ? undefined : Link}
                href={
                  onPageChange
                    ? undefined
                    : { pathname, query: { ...query, page: page + 1 } }
                }
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={
                  onPageChange ? () => onPageChange(page + 1) : undefined
                }
              >
                {page + 1}
              </Button>
            )}
          </ButtonGroup>
        )}
        <IconButton
          as={onPageChange ? undefined : Link}
          href={
            onPageChange
              ? undefined
              : { pathname, query: { ...query, page: page + 1 } }
          }
          variant="outline"
          colorScheme="gray"
          rounded="full"
          size="sm"
          aria-label="next"
          icon={<Icon as={IoChevronForward} h={4} w={4} aria-hidden="true" />}
          isDisabled={!hasNextPage}
          pointerEvents={hasNextPage ? undefined : 'none'}
          onClick={onPageChange ? () => onPageChange(page + 1) : undefined}
        />
      </Flex>
    </Flex>
  )
}
