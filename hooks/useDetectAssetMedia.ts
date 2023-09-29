import { useMemo } from 'react'
import { FileDef } from '../convert'

export default function useDetectAssetMedia(
  asset:
    | {
        image: FileDef
        animation: FileDef | null
        unlockedContent: FileDef | null
      }
    | undefined
    | null,
): {
  media: FileDef
  fallback: FileDef | null
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
