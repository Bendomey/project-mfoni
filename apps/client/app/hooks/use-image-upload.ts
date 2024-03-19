import {useSignS3UploadUrl} from '@/api/contents/index.ts'
import {useState} from 'react'

const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  // const [progress, setProgress] = useState<number | null>(null); // TODO: support later!
  const {mutateAsync: generateSignedUrl, isPending} = useSignS3UploadUrl()

  // Cancel upload
  const abortController = new AbortController()

  const isLoading = isUploading || isPending

  const upload = async (file: File): Promise<string> => {
    try {
      setIsUploading(true)
      const filename = `${new Date().toISOString()}_${file.name}`

      const signedUrl = await generateSignedUrl({
        contentType: file.type,
        filename,
        abortController,
      })

      // Actual upload
      await fetch(signedUrl.signedUrl, {
        method: 'PUT',
        body: file,
        signal: abortController.signal,
      })

      return signedUrl.fileLink
    } finally {
      setIsUploading(false)
    }
  }

  return {upload, isLoading, abortController}
}

export default useImageUpload
