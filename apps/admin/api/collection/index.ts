/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all collections based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The collections data.
 */

const getCollections = async (
  props: FetchMultipleDataInputParams<FetchCollectionFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchCollectionFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<Collection> = await fetchClient(
      `/v1/collections?${params.toString()}`,
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

export const useGetCollections = (
  query: FetchMultipleDataInputParams<FetchCollectionFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.COLLECTIONS,JSON.stringify(query)],
    queryFn: () => getCollections(query),
  })


/**
 * Feature collection
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 *  @returns {Promise<object>} - The collection data.
 */

const featureCollection = async (id: string) => {
  try {
    await fetchClient<Collection>(`/v1/collections/${id}/feature`, {
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

export const useFeatureCollection = () => useMutation({mutationFn: featureCollection})
