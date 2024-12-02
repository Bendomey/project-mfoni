/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all administrators based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The administrators data.
 */

const getAdmins = async (
  props: FetchMultipleDataInputParams<FetchAdminFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchAdminFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<CreatorApplication> = await fetchClient(
      `/v1/admins?${params.toString()}`,
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

export const useGetAdmins = (
  query: FetchMultipleDataInputParams<FetchAdminFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.ADMINISTRATORS,JSON.stringify(query)],
    queryFn: () => getAdmins(query),
  })

