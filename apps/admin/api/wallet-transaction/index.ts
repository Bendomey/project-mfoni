/**
 * @example How to use fetch client
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {fetchClient, getQueryParams} from '@/lib'
import {QUERY_KEYS} from '@/constants/misc'

/**
 * GET all wallet transactions based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The wallet transaction data.
 */

const getWalletTransactions = async (
  props: FetchMultipleDataInputParams<FetchWalletTransactionFilter>,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchWalletTransactionFilter>(props)
    const params = new URLSearchParams(removeAllNullableValues)

    const response: APIResponse<WalletTransaction> = await fetchClient(
      `/v1/admins/wallet-transactions?${params.toString()}`,
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

export const useGetWalletTransactions = (
  query: FetchMultipleDataInputParams<FetchWalletTransactionFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.WALLET_TRANSACTIONS,JSON.stringify(query)],
    queryFn: () => getWalletTransactions(query),
  })


/**
 * GET wallet based on a query.
 *
 * @throws {Error} - Throws an error if there's a problem with the API response.
 *
 * @returns {Promise<object>} - The wallet data.
 */

const getWallet = async () => {
  try {
    const response = await fetchClient<ApiResponse<Wallet>>(
      `/v1/admins/wallet`,
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

export const useGetWallet = () =>
  useQuery({
    queryKey: [QUERY_KEYS.WALLET],
    queryFn: () => getWallet(),
  })

