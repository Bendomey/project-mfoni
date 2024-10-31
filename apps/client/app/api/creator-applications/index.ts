import {QUERY_KEYS} from '@/constants/index.ts'
import {fetchClient} from '@/lib/transport/index.ts'
import {useMutation, useQuery} from '@tanstack/react-query'

const getActiveCreatorApplication = async () => {
    try {
        const response = await fetchClient<ApiResponse<CreatorApplication>>(
            '/v1/users/creator-applications/active',
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

export const useGetActiveCreatorApplication = ({enabled}: { enabled: boolean }) =>
    useQuery({
        queryKey: [QUERY_KEYS.CREATOR_APPLICATIONS, 'user:active'],
        queryFn: getActiveCreatorApplication,
        enabled,
    })

interface CreateCreatorApplicationInputProps {
    creatorPackageType: string;
    idType: string;
    idFrontImage: string;
    idBackImage: string;
}

const createCreatorApplication = async (params: CreateCreatorApplicationInputProps) => {
    try {
        const response = await fetchClient<ApiResponse<CreatorApplication>>(
            '/v1/creator-applications',
            {
                method: 'POST',
                body: JSON.stringify(params),
            }
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

export const useCreateCreatorApplication = () =>
    useMutation({
        mutationFn: createCreatorApplication,
    })


interface UpdateCreatorApplicationInputProps {
    id: string;
    creatorPackageType?: string;
    idType?: string;
    idFrontImage?: string;
    idBackImage?: string;
}

const updateCreatorApplication = async (params: UpdateCreatorApplicationInputProps) => {
    try {
        const response = await fetchClient<ApiResponse<CreatorApplication>>(
            `/v1/creator-applications/${params.id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    ...params,
                    id: undefined,
                }),
            }
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

export const useUpdateCreatorApplication = () =>
    useMutation({
        mutationFn: updateCreatorApplication,
    })


const submitCreatorApplication = async (creatorApplicationId: string) => {
    try {
        const response = await fetchClient<ApiResponse<CreatorApplication>>(
            `/v1/creator-applications/${creatorApplicationId}/submit`,
            {
                method: 'PATCH'
            }
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

export const useSubmitCreatorApplication = () =>
    useMutation({
        mutationFn: submitCreatorApplication,
    })

