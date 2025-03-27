import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/index.ts";
import { getQueryParams } from "@/lib/get-param.ts";
import { fetchClient } from "@/lib/transport/index.ts";

export const getCreatorByUsername = async (
  username: string,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<EnhancedCreator>>(
      `/v1/creators/${username}`,
      {
        ...(apiConfig ? apiConfig : {}),
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

export const getRelatedCreators = async (
  username: string,
  props: FetchMultipleDataInputParams<unknown>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<unknown>(props);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<BasicCreator>>
    >(`/v1/creators/${username}/related?${params.toString()}`, {
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

export const useGetRelatedCreators = (
  username: string,
  query: FetchMultipleDataInputParams<FetchWalletTransactionFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CREATORS, "related", username, query],
    queryFn: () => getRelatedCreators(username, query),
  });

export const getCreators = async (
  props: FetchMultipleDataInputParams<unknown>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<unknown>(props);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<EnhancedCreator>>
    >(`/v1/creators?${params.toString()}`, {
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

export const useGetCreators = (query: FetchMultipleDataInputParams<unknown>) =>
  useQuery({
    queryKey: [QUERY_KEYS.CREATORS, query],
    queryFn: () => getCreators(query),
  });

interface UpdateCreatorBasicDetails {
  address: Nullable<string>;
  about: Nullable<string>;
  interests: Array<string>;
  socialMedia: Array<CreatorSocialMedia>;
}

export const updateCreatorBasicDetails = async (
  input: UpdateCreatorBasicDetails,
) => {
  try {
    const response = await fetchClient<ApiResponse<Collection>>(
      `/v1/creators`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
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

export const useUpdateCreatorBasicDetails = () =>
  useMutation({
    mutationFn: updateCreatorBasicDetails,
  });
