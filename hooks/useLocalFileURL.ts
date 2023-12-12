import { useEffect, useMemo, useState } from 'react'

/**
 * Hook returning an URL for a local file that can be used to use a file in any component image, video, sound
 * @param file -- file we want to create an URL for
 * @returns string | null -- object url of the file blob://xxx
 */
export default function useLocalFileURL(file?: File): {
  url: string
  mimetype: string | null
} | null {
  const [url, setUrl] = useState<string | null>(null)
  const mimetype = useMemo(() => file?.type || null, [file])
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return url ? { url, mimetype } : null
}
