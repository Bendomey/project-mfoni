import {QUERY_KEYS} from '@/constants/index.ts'
import {fetchClient} from '@/lib/transport/index.ts'
import {useMutation, useQuery} from '@tanstack/react-query'

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

  interface UpdateEmailInputProps {
    emailAddress: string
  }
  
  const updateEmail = async (input: UpdateEmailInputProps) => {
    try {
      const response = await fetchClient<ApiResponse<boolean>>(
        '/v1/users/email',
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
  
  export const useUpdateEmail = () =>
    useMutation({
      mutationFn: updateEmail,
    })
  
  interface VerifyEmailInputProps {
    verificationCode: string
  }
  
  const verifyEmail = async (input: VerifyEmailInputProps) => {
    try {
      const response = await fetchClient<ApiResponse<boolean>>(
        '/v1/users/email/verify',
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
  
  export const useVerifyEmail = () =>
    useMutation({
      mutationFn: verifyEmail,
    })
  

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

export const useGetActiveCreatorApplication = ({enabled}: {enabled: boolean}) =>
  useQuery({
    queryKey: [QUERY_KEYS.CREATOR_APPLICATIONS, 'user:active'],
    queryFn: getActiveCreatorApplication,
    enabled,
  })
