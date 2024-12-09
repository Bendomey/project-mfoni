import {fetchClient} from '@/lib/transport/index.ts'
import {useMutation} from '@tanstack/react-query'

interface IGenerateSignedUrlInput {
  filename: string
  contentType: string
  abortController: AbortController
}

interface IGenerateSignedUrlOutput {
  fileLink: string
  signedUrl: string
}

export const generateSignedUrl = async (props: IGenerateSignedUrlInput) => {
  const res = await fetch('/api/s3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: props.filename,
      contentType: props.contentType,
    }),
    signal: props.abortController.signal,
  })
  const data = await res.json()
  return data as IGenerateSignedUrlOutput
}

export const useSignS3UploadUrl = () =>
  useMutation({
    mutationFn: generateSignedUrl,
  })

export type CreateContentInput = Array<{
  title: string
  content: {
    location: string
    eTag: string
    key: string
    serverSideEncryption: string
    bucket: string
    orientation: IContentOrientation
    size: number
  }
  tags?: string[]
  visibility: IContentVisibility
  amount?: number
}>

export const createContent = async (
  props: CreateContentInput,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<Array<Content>>>(
      `/v1/contents`,
      {
        method: 'POST',
        body: JSON.stringify(props),
        ...(apiConfig ? apiConfig : {}),
      },
    )

    return response.parsedBody.data
  } catch (error: unknown) {
    // Error from server.
    if (error instanceof Response) {
      const response = await error.json()
      throw new Error(response.errorMessage)
    }

    if (error instanceof Error) {
      throw error
    }
  }
}
