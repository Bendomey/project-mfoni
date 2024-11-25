/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all creator applications based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The creator applications data.
 */

const getCreatorApplications = async (
  props: FetchMultipleDataInputParams<FetchCreatorApplicationFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchCreatorApplicationFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<CreatorApplication> = await fetchClient(
      `/v1/creator-applications?${params.toString()}`,
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

export const useGetCreatorApplications = (
  query: FetchMultipleDataInputParams<FetchCreatorApplicationFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CREATOR_APPLICATIONS,JSON.stringify(query)],
    queryFn: () => getCreatorApplications(query),
  })


  /**
   * Approve creator application
   *
   * @throws {Error} - Throws an error if there's a problem with the API response.
   *
   *  @returns {Promise<object>} - The creator application data.
   */
  
  const approveCreatorApplication = async (id: string) => {
    try {
      await fetchClient<CreatorApplication>(`/v1/creator-applications/${id}/approve`, {
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
  
  export const useApproveCreatorApplication = () => useMutation({mutationFn: approveCreatorApplication})
  

  /**
   * Reject creator application
   *
   * @throws {Error} - Throws an error if there's a problem with the API response.
   *
   *  @returns {Promise<object>} - The creator application data.
   */
  
  const rejectCreatorApplication = async (id: string) => {
    try {
      await fetchClient<CreatorApplication>(`/v1/creator-applications/${id}/reject`, {
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
  
  export const useRejectCreatorApplication = () => useMutation({mutationFn: rejectCreatorApplication})
  