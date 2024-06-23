import {QUERY_KEYS} from '@/constants/index.ts'
import {getQueryParams} from '@/lib/get-param.ts'
import {fetchClient} from '@/lib/transport/index.ts'
import {useQuery} from '@tanstack/react-query'

const getTags = async (props: FetchMultipleDataInputParams<FetchTagFilter>) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchTagFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<Tag>>
    >(`/v1/tags?${params.toString()}`)

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

export const useGetTags = (
  query: FetchMultipleDataInputParams<FetchTagFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.TAGS, query],
    queryFn: () => getTags(query),
  })
