import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/index.ts";
import { getQueryParams } from "@/lib/get-param.ts";
import { fetchClient } from "@/lib/transport/index.ts";

export const getSavedCards = async (
  props: FetchMultipleDataInputParams<FetchSavedCardFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchSavedCardFilter>(props);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<SavedCard>>
    >(`/v1/saved-cards?${params.toString()}`, {
      ...(apiConfig ? apiConfig : {}),
    });

    return response.parsedBody.data;
  } catch (error: unknown) {
    // Error from server.
    if (error instanceof Response) {
      const response = await error.json();
      throw new Error(response.errorMessage);
    }

    if (error instanceof Error) {
      throw error;
    }
  }
};

export const useGetSavedCards = (
  query: FetchMultipleDataInputParams<FetchSavedCardFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.SAVED_CARDS, query],
    queryFn: () => getSavedCards(query),
  });

interface InitiateSavedCardCreationInput {
  billingEmail: string;
}

export const initiateSavedCardCreationInput = async (
  createSavedCardInput: InitiateSavedCardCreationInput,
  apiConfig: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<Payment>>(
      `/v1/saved-cards`,
      {
        method: "POST",
        body: JSON.stringify(createSavedCardInput),
        ...apiConfig,
      },
    );

    if (!response.parsedBody.status && response.parsedBody.errorMessage) {
      throw new Error(response.parsedBody.errorMessage);
    }

    return response.parsedBody.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }

    // Error from server.
    if (error instanceof Response) {
      const response = await error.json();
      throw new Error(response.errorMessage);
    }
  }
};

export const deleteSavedCard = async (
	savedCardId: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<unknown>>(
			`/v1/saved-cards/${savedCardId}`,
			{
				method: 'DELETE',
				...apiConfig,
			},
		)

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}
        
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

export const makeSavedCardPrimary = async (
	savedCardId: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchClient<ApiResponse<unknown>>(
			`/v1/saved-cards/${savedCardId}/set-as-primary`,
			{
				method: 'POST',
				...apiConfig,
			},
		)

		if (!response.parsedBody.status && response.parsedBody.errorMessage) {
			throw new Error(response.parsedBody.errorMessage)
		}
        
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
