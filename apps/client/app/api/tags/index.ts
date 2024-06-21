import {fetchClient} from '@/lib/transport/index.ts'
import {useQuery} from '@tanstack/react-query'

const getTags = async () => {
  try {
    const response = await fetchClient<ApiResponse<Array<Tag>>>('/v1/tags')

    if (!response.parsedBody.status && response.parsedBody.errorMessage) {
      throw new Error(response.parsedBody.errorMessage)
    }

    return response.parsedBody.data
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }

    // Error from server.
    if (error instanceof Response) {
      const response = await error.json()
      throw new Error(response.errorMessage)
    }
  }
}

export const useGetTags = () =>
  useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  })
