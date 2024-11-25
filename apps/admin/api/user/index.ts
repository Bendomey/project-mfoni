/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all users based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The users data.
 */

const getUsers = async (
  props: FetchMultipleDataInputParams<FetchUserFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchUserFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<User> = await fetchClient(
      `/v1/users?${params.toString()}`,
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

export const useGetUsers = (
  query: FetchMultipleDataInputParams<FetchUserFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.USERS,JSON.stringify(query)],
    queryFn: () => getUsers(query),
  })
