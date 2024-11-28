import {QUERY_KEYS} from '@/constants/index.ts'
import {getQueryParams} from '@/lib/get-param.ts'
import {fetchClient} from '@/lib/transport/index.ts'
import {useMutation, useQuery} from '@tanstack/react-query'

export const getCreatorSubscriptions = async (
  props: FetchMultipleDataInputParams<FetchCreatorSubscriptionFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues =
      getQueryParams<FetchCreatorSubscriptionFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<CreatorSubscription>>
    >(`/v1/subscriptions?${params.toString()}`, {
      ...(apiConfig ? apiConfig : {}),
    })

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

export const useGetCreatorSubscriptions = (
  query: FetchMultipleDataInputParams<FetchCreatorSubscriptionFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CREATOR_SUBSCRIPTIONS, query],
    queryFn: () => getCreatorSubscriptions(query),
  })

export const isSubscriptionCancelled = async (id: string) => {
  try {
    const response = await fetchClient<ApiResponse<CreatorSubscription>>(
      `/v1/creator-subscriptions/${id}/is-cancelled`,
    )

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
export const useIsSubscriptionCancelled = (id?: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.CREATOR_SUBSCRIPTIONS, id, 'is-cancelled'],
    queryFn: () => isSubscriptionCancelled(id ?? ''),
    enabled: Boolean(id),
  })

export const cancelSubscription = async () => {
  try {
    const response = await fetchClient<ApiResponse<boolean>>(
      '/v1/creator-subscriptions/cancel',
      {
        method: 'PATCH',
      },
    )

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
export const useCancelSubscription = () =>
  useMutation({
    mutationFn: cancelSubscription,
  })
