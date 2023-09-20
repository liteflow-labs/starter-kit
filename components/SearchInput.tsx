import { Icon, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { HiOutlineX } from '@react-icons/all-files/hi/HiOutlineX'
import { useRouter } from 'next/router'
import { FC, HTMLAttributes, useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

type IProps = HTMLAttributes<any> & {
  name: string
  onReset?: () => void
  onSubmit?: () => void
}

const SearchInput: FC<IProps> = ({ name, onReset, onSubmit, ...props }) => {
  const { query, push, pathname } = useRouter()
  const { register, watch } = useFormContext()
  const search = watch(name)
  const searchActive = useMemo(() => !!query.search, [query.search])

  const resetSearch = useCallback(async () => {
    if (onReset) return onReset()
    await push(
      { pathname, query: { ...query, search: undefined, page: undefined } },
      undefined,
      {
        shallow: true,
      },
    )
  }, [onReset, push, query, pathname])

  return (
    <InputGroup>
      <Input {...register(name)} type="search" pr={14} {...props} />
      <InputRightElement w={12} mr={2} pl={0} justifyContent="flex-end" gap={1}>
        {((onReset && search) || searchActive) && (
          <Icon
            as={HiOutlineX}
            w={5}
            h={5}
            color="black"
            cursor="pointer"
            onClick={resetSearch}
          />
        )}
        <Icon
          as={HiOutlineSearch}
          w={6}
          h={6}
          color="black"
          cursor="pointer"
          onClick={onSubmit ?? undefined}
        />
      </InputRightElement>
    </InputGroup>
  )
}

export default SearchInput
