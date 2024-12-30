/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all contents based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The contents data.
 */

const getContents = async (
  props: FetchMultipleDataInputParams<FetchContentFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchContentFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<Content> = await fetchClient(
      `/v1/contents?${params.toString()}`,
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

export const useGetContents = (
  query: FetchMultipleDataInputParams<FetchContentFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENTS,JSON.stringify(query)],
    queryFn: () => getContents(query),
  })
