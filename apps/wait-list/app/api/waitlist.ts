import {fetchClient} from '@/lib/transport/index.ts'
import {useMutation} from '@tanstack/react-query'

interface JoinWaitListRequest {
  userType: User
  name: string
  email?: string
  phoneNumber: string
}

interface JoinWaitListResponse {
  id: string
  name: string
  phoneNumber: string
  email: string
  type: User
}

export const joinWaitListFetcher = async (request: JoinWaitListRequest) => {
  try {
    const response = await fetchClient<ApiResponse<JoinWaitListResponse>>(
      '/v1/waitlists',
      {
        method: 'POST',
        body: JSON.stringify(request),
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

export const useJoinWaitList = () =>
  useMutation({
    mutationFn: joinWaitListFetcher,
  })
