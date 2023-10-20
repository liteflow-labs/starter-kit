import { useMemo } from 'react'

export type AssetMedia = {
  url: string
  mimetype?: string | null
} | null

export default function useDetectAssetMedia(
  asset:
    | {
        image: AssetMedia
        animation: AssetMedia | null
        unlockedContent: AssetMedia | null
      }
    | undefined
    | null,
): {
  media: AssetMedia
  fallback: AssetMedia | null
} {
  const media = useMemo(() => {
    if (!asset) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="transparent" /></svg>`
      return {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        mimetype: 'image/svg+xml',
      }
    }
    if (asset.unlockedContent) return asset.unlockedContent
    if (asset.animation) return asset.animation
    return asset.image
  }, [asset])

  const fallback = useMemo(() => {
    if (!asset) return null
    if (asset.animation) return asset.image
    return null
  }, [asset])

  return {
    media,
    fallback,
  }
}
