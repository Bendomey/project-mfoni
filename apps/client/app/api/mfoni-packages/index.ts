import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/index.ts";
import { getQueryParams } from "@/lib/get-param.ts";
import { fetchClient } from "@/lib/transport/index.ts";

export const getMfoniPackages = async (
  props: FetchMultipleDataInputParams<FetchMfoniPackageFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues =
      getQueryParams<FetchMfoniPackageFilter>(props);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<MfoniPackage>>
    >(`/v1/mfoni-packages?${params.toString()}`, {
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

export const useGetMfoniPackages = ({
  query,
  retryQuery,
}: {
  query: FetchMultipleDataInputParams<FetchMfoniPackageFilter>;
  retryQuery?: boolean;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.MFONI_PACKAGES, query],
    queryFn: () => getMfoniPackages(query),
    retry: retryQuery,
  });
