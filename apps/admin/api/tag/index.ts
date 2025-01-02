/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all tags based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The tags data.
 */

const getTags = async (
  props: FetchMultipleDataInputParams<FetchTagFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchTagFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<Tag> = await fetchClient(
      `/v1/tags?${params.toString()}`,
    )

    return response.parsedBody.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    // Error from server.
    if (error instanceof Response) {
      const response = await error.json()
      throw new Error(response.message)
    }
  }
}

export const useGetTags = (
  query: FetchMultipleDataInputParams<FetchTagFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.TAGS,JSON.stringify(query)],
    queryFn: () => getTags(query),
  })


/**
 * Feature tag
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 *  @returns {Promise<object>} - The tag data.
 */

const featureTag = async (id: string) => {
  try {
    await fetchClient<Tag>(`/v1/tags/${id}/feature`, {
      method: 'PATCH',
    })
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    // Error from server.
    if (error instanceof Response) {
      const response = await error.json()
      throw new Error(response.message)
    }
  }
}

export const useFeatureTag = () => useMutation({mutationFn: featureTag})
