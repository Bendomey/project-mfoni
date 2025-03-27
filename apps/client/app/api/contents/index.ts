import { useQuery } from "@tanstack/react-query";
import { type ContentSize } from "@/components/download-button.tsx";
import { QUERY_KEYS } from "@/constants/index.ts";
import { getQueryParams } from "@/lib/get-param.ts";
import { safeString } from "@/lib/strings.ts";
import { fetchClient } from "@/lib/transport/index.ts";

export type CreateContentInput = Array<{
  title: string;
  content: {
    location: string;
    eTag: string;
    key: string;
    serverSideEncryption: string;
    bucket: string;
    orientation: IContentOrientation;
    backgroundColor?: string;
    size: number;
  };
  tags?: string[];
  visibility: IContentVisibility;
  amount?: number;
}>;

export const createContent = async (
  props: CreateContentInput,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<Array<Content>>>(
      `/v1/contents`,
      {
        method: "POST",
        body: JSON.stringify(props),
        ...(apiConfig ? apiConfig : {}),
      },
    );

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

export const likeContent = async (
  contentId: string,
  apiConfig: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<ContentLike>>(
      `/v1/contents/${contentId}/likes`,
      {
        method: "POST",
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

export const unlikeContent = async (
  contentId: string,
  apiConfig: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<boolean>>(
      `/v1/contents/${contentId}/likes`,
      {
        method: "DELETE",
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

interface DownloadContentInput {
  contentId: string;
  size: ContentSize;
}

export const downloadContent = async (
  downloadContentInput: DownloadContentInput,
  apiConfig: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<ContentMedia>>(
      `/v1/contents/${downloadContentInput.contentId}/download`,
      {
        method: "POST",
        body: JSON.stringify({ size: downloadContentInput.size }),
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

interface BuyContentInput {
  contentId: string;
  paymentMethod: ContentPurchase["type"];
}

export const buyContent = async (
  buyContentInput: BuyContentInput,
  apiConfig: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<
      ApiResponse<{ contentPurchase: ContentPurchase; payment: Payment }>
    >(`/v1/contents/${buyContentInput.contentId}/buy`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod: buyContentInput.paymentMethod }),
      ...apiConfig,
    });

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

export const getContentLikes = async (
  query: FetchMultipleDataInputParams<unknown>,
  contentId: string,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<unknown>(query);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<ContentLike>>
    >(`/v1/contents/${contentId}/likes?${params.toString()}`, {
      ...(apiConfig ? apiConfig : {}),
    });

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

export const useGetContentLikes = (
  query: FetchMultipleDataInputParams<unknown>,
  contentId: string,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENT_LIKES, contentId, query],
    queryFn: () => getContentLikes(query, contentId),
  });

export const getContentBySlug = async (
  slug: string,
  query: FetchMultipleDataInputParams<FetchContentFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchContentFilter>(query);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<ApiResponse<Content>>(
      `/v1/contents/${slug}/slug?${params.toString()}`,
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

export const useGetContentBySlug = ({
  slug,
  query,
  retryQuery,
}: {
  slug?: string;
  query: FetchMultipleDataInputParams<FetchContentFilter>;
  retryQuery?: boolean;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENTS, slug, "slug", query],
    queryFn: () => getContentBySlug(safeString(slug), query),
    enabled: Boolean(slug),
    retry: retryQuery,
  });

export const getRelatedContents = async (
  contentId: string,
  query: FetchMultipleDataInputParams<unknown>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<unknown>(query);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<Content>>
    >(`/v1/contents/${contentId}/related?${params.toString()}`, {
      ...(apiConfig ? apiConfig : {}),
    });

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

export const useGetRelatedContents = ({
  contentId,
  query,
  retryQuery,
}: {
  contentId?: string;
  query: FetchMultipleDataInputParams<unknown>;
  retryQuery?: boolean;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENTS, contentId, "related", query],
    queryFn: () => getRelatedContents(safeString(contentId), query),
    enabled: Boolean(contentId),
    retry: retryQuery,
  });

export const getContents = async (
  query: FetchMultipleDataInputParams<FetchContentFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchContentFilter>(query);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<Content>>
    >(`/v1/contents?${params.toString()}`, {
      ...(apiConfig ? apiConfig : {}),
    });

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

export const useGetContents = ({
  query,
  retryQuery,
}: {
  query: FetchMultipleDataInputParams<FetchContentFilter>;
  retryQuery?: boolean;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENTS, query],
    queryFn: () => getContents(query),
    retry: retryQuery,
  });

export const searchTextualContents = async (
  query: FetchMultipleDataInputParams<FetchContentFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchContentFilter>(query);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<Content>>
    >(`/v1/contents/search/textual?${params.toString()}`, {
      ...(apiConfig ? apiConfig : {}),
    });

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

export const useSearchTextualContents = ({
  query,
  retryQuery,
}: {
  query: FetchMultipleDataInputParams<FetchContentFilter>;
  retryQuery?: boolean;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENTS, "textual-search", query],
    queryFn: () => searchTextualContents(query),
    retry: retryQuery,
  });

export const searchVisualContents = async (
  query: FetchMultipleDataInputParams<
    FetchContentFilter & { mediaKey: string }
  >,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues = getQueryParams<FetchContentFilter>(query);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<{
        results: FetchMultipleDataResponse<Content>;
        imageUrl: string;
      }>
    >(
      `/v1/contents/search/visual/${query.filters
        ?.mediaKey}?${params.toString()}`,
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

export const useSearchVisualContents = ({
  query,
  retryQuery,
}: {
  query: FetchMultipleDataInputParams<
    FetchContentFilter & { mediaKey: string }
  >;
  retryQuery?: boolean;
}) =>
  useQuery({
    queryKey: [QUERY_KEYS.CONTENTS, "visual-search", query],
    queryFn: () => searchVisualContents(query),
    retry: retryQuery,
  });

interface UpdateContentInput {
  title?: string;
  visibility?: string;
  amount?: number;
}

export const updateContent = async (
  contentId: string,
  data: UpdateContentInput,
  apiConfig: ApiConfigForServerConfig,
) => {
  try {
    const response = await fetchClient<ApiResponse<boolean>>(
      `/v1/contents/${contentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
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
