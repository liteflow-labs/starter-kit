import { Flex } from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import invariant from 'ts-invariant'
import useEnvironment from '../../hooks/useEnvironment'
import Slider from '../Slider/Slider'
import TokenHeader from './FeaturedToken'

type Props = {
  date: Date
}

const FeaturedHomeSection: FC<Props> = ({ date }) => {
  const { FEATURED_TOKEN } = useEnvironment()

  const featuredAssets = useMemo(
    () =>
      FEATURED_TOKEN.map((x) => x.split('-')).map(
        ([chainId, collectionAddress, tokenId], index) => {
          invariant(
            chainId !== undefined &&
              collectionAddress !== undefined &&
              tokenId !== undefined,
            'invalid feature token',
          )
          return (
            <TokenHeader
              key={index}
              chainId={parseInt(chainId, 10)}
              collectionAddress={collectionAddress.toLowerCase()}
              tokenId={tokenId}
              date={date}
            />
          )
        },
      ),
    [FEATURED_TOKEN, date],
  )

  if (FEATURED_TOKEN.length === 0) return null
  if (FEATURED_TOKEN.length === 1) return <header>{featuredAssets}</header>
  return (
    <header>
      <Flex as={Slider}>{featuredAssets}</Flex>
    </header>
  )
}

export default FeaturedHomeSection
