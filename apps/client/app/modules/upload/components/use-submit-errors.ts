import {useMemo} from 'react'
import {useContentUpload} from '../context.tsx'

export const useSubmitErrors = () => {
  const {contents: baseContents} = useContentUpload()

  const contents = Object.values(baseContents)

  const errorMessages = useMemo(() => {
    const messages = []
    // no content added
    if (contents.length === 0) {
      messages.push('Please add some contents before submit')
    }

    // no rejected images / no upload errors
    if (
      contents.some(
        content =>
          content.status === 'rejected' || content.uploadStatus === 'failed',
      )
    ) {
      messages.push('Make sure all uploads are successful.')
    }

    // uploads are still pending
    if (
      contents.some(
        content =>
          content.uploadStatus && ['uploading'].includes(content.uploadStatus),
      )
    ) {
      messages.push('Some uploads are still pending. Please wait.')
    }

    return messages
  }, [contents])

  return {
    errorMessages,
    isSubmittable: errorMessages.length === 0,
  }
}
