import { useMemo } from 'react'

export type AssetMedia = {
  url: string
  mimetype?: string | null
} | null

export default function useDetectAssetMedia(
  asset:
    | {
        image: string
        imageMimetype: string | null
        animationUrl?: string | null
        animationMimetype?: string | null
      }
    | undefined
    | null,
): {
  media: AssetMedia
  fallback: AssetMedia
} {
  const media = useMemo(() => {
    if (!asset) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="transparent" /></svg>`
      return {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        mimetype: 'image/svg+xml',
      }
    }
    if (asset.animationUrl)
      return { url: asset.animationUrl, mimetype: asset.animationMimetype }
    return { url: asset.image, mimetype: asset.imageMimetype }
  }, [asset])

  const fallback = useMemo(() => {
    if (!asset) return null
    if (asset.animationUrl)
      return { url: asset.image, mimetype: asset.imageMimetype }
    return null
  }, [asset])

  return {
    media,
    fallback,
  }
}
