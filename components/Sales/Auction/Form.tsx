import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { toAddress } from '@liteflow/core'
import { useCreateAuction } from '@liteflow/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import useParseBigNumber from '../../../hooks/useParseBigNumber'
import { formatError, getHumanizedDate } from '../../../utils'
import Image from '../../Image/Image'
import Select from '../../Select/Select'

type FormData = {
  endAt: string
  price: string
  startedAt: string
  currencyId: string
}

type Props = {
  signer: Signer | undefined
  assetId: string
  currencies: {
    name: string
    id: string
    address: string
    image: string
    decimals: number
    symbol: string
  }[]
  auctionValidity: number
  onCreated: (id: string) => void
}

const SalesAuctionForm: FC<Props> = ({
  signer,
  assetId,
  currencies,
  auctionValidity,
  onCreated,
}) => {
  const { t } = useTranslation('components')
  const [createAuction, { loading }] = useCreateAuction(signer)
  const toast = useToast()
  const {
    register,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      currencyId: currencies[0]?.id,
    },
  })

  useEffect(() => {
    const defaultCurrency = currencies[0]?.id
    if (defaultCurrency) setValue('currencyId', defaultCurrency)
  }, [currencies, setValue])

  const price = watch('price')

  const currencyId = watch('currencyId')
  const currency = useMemo(() => {
    const c = currencies.find((x) => x.id === currencyId)
    if (!c) throw new Error("Can't find currency")
    return c
  }, [currencies, currencyId])
  const priceUnit = useParseBigNumber(price, currency.decimals)

  // TODO: Add check for approval of maker token
  const onSubmit = handleSubmit(async (data) => {
    if (loading) return

    const [chain, collection, token] = assetId.split('-')
    invariant(chain)
    invariant(collection)
    invariant(token)
    try {
      const auctionId = await createAuction({
        chain: parseInt(chain, 10),
        collection: toAddress(collection),
        token,
        endAt: new Date(data.endAt),
        auctionValiditySeconds: auctionValidity,
        reservePrice: {
          amount: (priceUnit || BigNumber.from(0)).toString(),
          currency: toAddress(currency.address),
        },
      })

      onCreated(auctionId)
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    }
  })

  return (
    <Stack as="form" spacing={8} onSubmit={onSubmit}>
      <Stack spacing={6}>
        {currencies.length > 1 && (
          <Select
            label={t('sales.auction.form.currency.label')}
            name="currencyId"
            hint={t('sales.auction.form.currency.hint')}
            control={control}
            placeholder={t('sales.auction.form.currency.placeholder')}
            choices={currencies.map((x) => ({
              value: x.id,
              label: x.symbol || '',
              image: x.image,
              caption: x.name,
            }))}
            value={currencyId}
            required
            error={errors.currencyId}
            onChange={(x: any) => setValue('currencyId', x)}
            sortAlphabetically
          />
        )}

        <FormControl isInvalid={!!errors.price}>
          <HStack spacing={1}>
            <FormLabel htmlFor="price" m={0}>
              {t('sales.auction.form.price.label')}
            </FormLabel>
            <FormHelperText m={0}>({currency.symbol})</FormHelperText>
            <FormHelperText m={0}>
              {t('sales.auction.form.price.info')}
            </FormHelperText>
          </HStack>
          <FormHelperText mb={2}>
            {t('sales.auction.form.price.hint')}
          </FormHelperText>
          <InputGroup>
            <NumberInput
              clampValueOnBlur={false}
              min={0}
              step={Math.pow(10, -currency.decimals)}
              allowMouseWheel
              w="full"
              onChange={(x) => setValue('price', x)}
            >
              <NumberInputField
                id="price"
                placeholder={t('sales.auction.form.price.placeholder')}
                {...register('price', {
                  validate: (value) => {
                    if (value !== undefined && parseFloat(value) < 0)
                      return t('sales.auction.form.validation.positive')
                    const nbDecimals = value.split('.')[1]?.length || 0
                    if (nbDecimals > currency.decimals)
                      return t('sales.auction.form.validation.decimals', {
                        nbDecimals: currency.decimals,
                      })
                  },
                })}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightElement mr={6} pointerEvents="none">
              <Image
                src={currency.image}
                alt={currency.symbol}
                width={24}
                height={24}
                w={6}
                h={6}
                objectFit="cover"
              />
            </InputRightElement>
          </InputGroup>
          {errors.price && (
            <FormErrorMessage>{errors.price.message}</FormErrorMessage>
          )}
        </FormControl>
      </Stack>

      <Grid templateColumns="repeat(5, 1fr)" gap={6}>
        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel htmlFor="startedAt">
              {t('sales.auction.form.start.label')}
            </FormLabel>
            <Input
              placeholder={t('sales.auction.form.start.placeholder')}
              isDisabled
              {...register('startedAt')}
            />
          </FormControl>
        </GridItem>
        <GridItem colSpan={3}>
          <FormControl isInvalid={!!errors.endAt}>
            <FormLabel htmlFor="endAt">
              {t('sales.auction.form.end.label')}
            </FormLabel>
            <Input
              type="datetime-local"
              {...register('endAt', {
                required: t('sales.auction.form.validation.required'),
              })}
            />
            {errors.endAt && (
              <FormErrorMessage>{errors.endAt.message}</FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
      </Grid>

      <Alert status="warning" borderRadius="xl">
        <AlertIcon />
        <Box fontSize="sm">
          <AlertTitle>{t('sales.auction.form.banner.title')}</AlertTitle>
          <AlertDescription
            as="ul"
            display="flex"
            flexWrap="wrap"
            listStyleType="disc"
            pl={6}
          >
            <li>{t('sales.auction.form.banner.item1')}</li>
            <li>
              {t('sales.auction.form.banner.item2', {
                validity: getHumanizedDate(auctionValidity),
              })}
            </li>
          </AlertDescription>
        </Box>
      </Alert>

      <Button isLoading={loading} size="lg" width="full" type="submit">
        <Text as="span" isTruncated>
          {t('sales.auction.form.submit')}
        </Text>
      </Button>
    </Stack>
  )
}

export default SalesAuctionForm
