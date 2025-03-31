import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/index.ts";
import { getQueryParams } from "@/lib/get-param.ts";
import { fetchClient } from "@/lib/transport/index.ts";

interface InitiateTransferInput {
  amount: number;
  reason?: string;
  transferRecipientId: string;

  // use this when you want to retry a transfer.
  reference?: string;
}

export const initiateTransfer = async (input: InitiateTransferInput) => {
  try {
    const response = await fetchClient<ApiResponse<TransferRecipient>>(
      `/v1/transfers`,
      {
        method: "POST",
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

export const useInitiateTransfer = () =>
  useMutation({
    mutationFn: initiateTransfer,
  });

export const getTransferRecipients = async (
  props: FetchMultipleDataInputParams<FetchTransferRecipientFilter>,
  apiConfig?: ApiConfigForServerConfig,
) => {
  try {
    const removeAllNullableValues =
      getQueryParams<FetchTransferRecipientFilter>(props);
    const params = new URLSearchParams(removeAllNullableValues);
    const response = await fetchClient<
      ApiResponse<FetchMultipleDataResponse<TransferRecipient>>
    >(`/v1/transfers/recipients?${params.toString()}`, {
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

export const useGetTransferRecipients = (
  query: FetchMultipleDataInputParams<FetchTransferRecipientFilter>,
) =>
  useQuery({
    queryKey: [QUERY_KEYS.TRANSFER_RECIPIENTS, query],
    queryFn: () => getTransferRecipients(query),
  });

interface CreateTransferRecipientInput {
  type: TransferRecipient["type"];
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
}

export const createTransferRecipient = async (
  input: CreateTransferRecipientInput,
) => {
  try {
    const response = await fetchClient<ApiResponse<TransferRecipient>>(
      `/v1/transfers/recipients`,
      {
        method: "POST",
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

export const useCreateTransferRecipient = () =>
  useMutation({
    mutationFn: createTransferRecipient,
  });

export const deleteTransferRecipient = async (id: string) => {
  try {
    const response = await fetchClient<ApiResponse<null>>(
      `/v1/transfers/recipients/${id}`,
      {
        method: "DELETE",
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

export const useDeleteTransferRecipient = () =>
  useMutation({
    mutationFn: deleteTransferRecipient,
  });
