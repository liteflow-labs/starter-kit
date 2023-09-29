import { useMemo } from 'react'

export type FileResult = {
  url: string
  mimetype?: string | null
}

export default function useDetectAssetMedia(
  asset:
    | {
        image: string
        animationUrl: string | null | undefined
        unlockedContent:
          | {
              url: string
              mimetype: string | null
            }
          | null
          | undefined
      }
    | undefined
    | null,
): {
  media: FileResult
  fallback: FileResult | null
} {
  const media = useMemo(() => {
    if (!asset)
      return {
        url: 'https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/cupertino_activity_indicator_small.gif',
      }
    if (asset.unlockedContent) return asset.unlockedContent
    if (asset.animationUrl) return { url: asset.animationUrl }
    return { url: asset.image }
  }, [asset])

  const fallback = useMemo(() => {
    if (!asset) return null
    if (asset.animationUrl) return { url: asset.image }
    return null
  }, [asset])

  return {
    media,
    fallback,
  }
}
