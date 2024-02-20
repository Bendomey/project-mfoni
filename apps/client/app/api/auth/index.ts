import {
  useMutation,
  useQuery,
  type UndefinedInitialDataOptions,
  type QueryKey,
} from '@tanstack/react-query'
import {fetchClient} from '@/lib/transport/index.ts'
import {QUERY_KEYS} from '@/constants/index.ts'

export const initiateTwitterAuth = async () => {
  const res = await fetch('/api/auth/twitter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      callbackUrl: window.location.origin + window.location.pathname,
    }),
  })
  const data = await res.json()
  return data
}

interface AuthenticateInputProps {
  provider: 'GOOGLE' | 'TWITTER' | 'FACEBOOK'
  google?: PossiblyUndefined<{authToken: string}>
  facebook?: PossiblyUndefined<{accessToken: string}>
  twitter?: PossiblyUndefined<{oAuthToken: string; oAuthVerifier: string}>
}

interface AuthenticateOutputProps {
  user: User
  token: string
}

export const authenticate = async (props: AuthenticateInputProps) => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props),
    })
    const data = await response.json()

    if (data.status) {
      return data.data as AuthenticateOutputProps
    }

    throw new Error(data.errorMessage)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error
    }
  }
}

export const useAuthenticate = () =>
  useMutation({
    mutationFn: authenticate,
  })

interface SetupAccountInputProps {
  role: 'CLIENT' | 'CREATOR'
  name: string
  username?: string
}

export const setupAccount = async (input: SetupAccountInputProps) => {
  try {
    const response = await fetchClient<ApiResponse<boolean>>('/v1/auth/setup', {
      method: 'POST',
      body: JSON.stringify(input),
    })

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
export const useSetupAccount = () =>
  useMutation({
    mutationFn: setupAccount,
  })

const getCurrentUser = async () => {
  try {
    const response = await fetchClient<ApiResponse<User>>('/v1/auth/me')

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
export const useGetCurrentUser = (
  opts?: Omit<
    UndefinedInitialDataOptions<
      User | undefined,
      Error,
      User | undefined,
      QueryKey
    >,
    'queryKey'
  >,
) =>
  useQuery({
    queryFn: getCurrentUser,
    queryKey: [QUERY_KEYS.CURRENT_USER],
    ...opts,
  })
