import { Icon, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { HiOutlineX } from '@react-icons/all-files/hi/HiOutlineX'
import { useRouter } from 'next/router'
import { FC, InputHTMLAttributes, useCallback, useMemo } from 'react'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { removeEmptyFromObject } from '../utils'

// Omit size from InputHTMLAttributes because of the chakra-ui Input component
type IProps = Omit<InputHTMLAttributes<any>, 'size'> & {
  name: string
  registerOptions?: RegisterOptions
  onReset?: () => void
  onSubmit?: () => void
}

const SearchInput: FC<IProps> = ({
  name,
  registerOptions,
  onReset,
  onSubmit,
  ...props
}) => {
  const { query, push, pathname } = useRouter()
  const { register, watch } = useFormContext()
  const search = !!watch(name)
  const searchActive = useMemo(() => !!query.search, [query.search])

  const resetSearch = useCallback(async () => {
    if (onReset) return onReset()
    const cleanData = removeEmptyFromObject({
      ...query,
      search: undefined,
      page: undefined,
    })
    await push({ pathname, query: cleanData }, undefined, {
      shallow: true,
    })
  }, [onReset, push, query, pathname])

  const deleteButtonActive = useMemo(
    () => (onReset && search) || (!onReset && searchActive),
    [onReset, search, searchActive],
  )

  return (
    <InputGroup>
      <Input
        {...register(name, registerOptions)}
        type="search"
        pr={deleteButtonActive ? 14 : 9}
        isTruncated
        minWidth={28}
        {...props}
      />
      <InputRightElement w={12} mr={2} pl={0} justifyContent="flex-end" gap={1}>
        {deleteButtonActive && (
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
