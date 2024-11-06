/**
 * @example How to use fetch client
 */

import {
  useMutation,
} from '@tanstack/react-query'
import {fetchClient} from '@/lib'

interface LoginProps {
  email: string
  password: string
}

export interface LoginOutputProps {
  token: string
  name: string
}

export const login = async (props: LoginProps) => {
  try {
    const response = await fetchClient<ApiResponse<LoginOutputProps>>(
      '/v1/admins/login',
      {
        method: 'POST',
        body: JSON.stringify(props),
        isUnAuthorizedRequest: true,
      },
    )

    return response.parsedBody
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

export const useLogin = () => useMutation({mutationFn: login})

const getCurrentAdmin = async ({}) => {
  try {
    const response = await fetchClient<ApiResponse<Admin>>(
      '/v1/admins/me',
    )
    return response.parsedBody
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
export const useGetCurrentAdmin = () =>
  useMutation({mutationFn: getCurrentAdmin})
