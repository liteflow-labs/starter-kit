import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  Flex,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Filter } from '../../hooks/useCollectionFilterFromQuery'
import useEnvironment from '../../hooks/useEnvironment'
import Image from '../Image/Image'

type Props = {
  filter: Filter
  onFilterChange: (filter: Filter) => void
}

export const NoFilter: Filter = {
  chains: [],
  search: null,
}

const FilterCollection: NextPage<Props> = ({ filter, onFilterChange }) => {
  const { CHAINS } = useEnvironment()
  const { t } = useTranslation('components')

  const { handleSubmit, reset, watch } = useForm<Filter>({
    defaultValues: filter,
  })
  const filterResult = watch()
  useEffect(() => {
    reset(filter)
    return () => reset({ chains: [] })
  }, [reset, filter])

  const propagateFilter = useCallback(
    (data: Partial<Filter> = {}) =>
      onFilterChange({ ...filterResult, ...data }),
    [filterResult, onFilterChange],
  )

  return (
    <Stack spacing={8} as="form" onSubmit={handleSubmit(onFilterChange)}>
      <Accordion allowMultiple defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton>
            <Heading variant="heading2" flex="1" textAlign="left">
              {t('filters.collections.chains.label')}
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <CheckboxGroup
              value={filterResult.chains}
              defaultValue={[]}
              onChange={(value) =>
                propagateFilter({ chains: value as number[] })
              }
            >
              <Stack spacing={1}>
                {CHAINS.map(({ id, name }, i) => (
                  <Checkbox key={i} value={id}>
                    <Flex gap={2} alignItems="center">
                      <Image
                        src={`/chains/${id}.svg`}
                        width={24}
                        height={24}
                        w={6}
                        h={6}
                        alt={name}
                      />
                      <Text
                        variant="subtitle2"
                        color="black"
                        noOfLines={1}
                        wordBreak="break-word"
                        title={name}
                      >
                        {name}
                      </Text>
                    </Flex>
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}

export default FilterCollection
