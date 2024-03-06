import {validateImageDimensions} from '@/lib/image-fns.ts'
import {ErrorCode} from 'react-dropzone-esm'

export const getErrorMessageForRejectedFiles = (
  errorCode: ErrorCode | string,
) => {
  switch (errorCode) {
    case ErrorCode.FileInvalidType:
      return 'Some media are of unsupported types'
    case ErrorCode.FileTooLarge:
      return 'Some media are too large'
    case ErrorCode.FileTooSmall:
      return 'Some media ares too small'
    case ErrorCode.TooManyFiles:
      return 'There are many media selected'
    default:
      return 'An error occured'
  }
}

export const acceptFile = async (file: File) => {
  let status = 'rejected'
  let message = 'An error occured'
  try {
    await validateImageDimensions({
      size: 400, // 4 megapixels
      imageUrl: URL.createObjectURL(file),
    })
    
    status = 'accepted'
    message = 'File accepted'
  } catch (error: unknown) {
    if (error instanceof Error) {
      status = 'rejected'
      message = error.message
    }
  }

  return {
    status,
    message,
    file,
  }
}
