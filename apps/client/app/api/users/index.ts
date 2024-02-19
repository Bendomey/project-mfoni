import {fetchClient} from '@/lib/transport/index.ts'
import {useMutation} from '@tanstack/react-query'

interface UpdatePhoneInputProps {
  phoneNumber: string
}

const updatePhone = async (input: UpdatePhoneInputProps) => {
  try {
    const response = await fetchClient<ApiResponse<boolean>>(
      '/v1/users/phone',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
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

export const useUpdatePhone = () =>
  useMutation({
    mutationFn: updatePhone,
  })

interface VerifyPhoneInputProps {
  verificationCode: string
}

const verifyPhone = async (input: VerifyPhoneInputProps) => {
  try {
    const response = await fetchClient<ApiResponse<boolean>>(
      '/v1/users/phone/verify',
      {
        method: 'PATCH',
        body: JSON.stringify(input),
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

export const useVerifyPhone = () =>
  useMutation({
    mutationFn: verifyPhone,
  })
