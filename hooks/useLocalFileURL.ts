import { useEffect, useState } from 'react'

/**
 * Hook returning an URL for a local file that can be used to use a file in any component image, video, sound
 * @param file -- file we want to create an URL for
 * @returns string | null -- object url of the file blob://xxx
 */
export default function useLocalFileURL(file?: File): string | null {
  const [localFile, setLocalFile] = useState<string | null>(null)
  useEffect(() => {
    if (!file) {
      setLocalFile(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setLocalFile(objectUrl)
    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return localFile
}
