import {useMutation} from '@tanstack/react-query'
import {fetchClient} from '@/lib/transport/index.ts'
import {QUERY_KEYS} from '@/constants/index.ts'

export const initiateTwitterAuth = async () => {
  const res = await fetch('/api/auth/twitter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({callbackUrl: window.location.origin + window.location.pathname}),
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

const getCurrentUser = async () => {
  try {
    const response = await fetchClient<User>('/v1/users/current')
    return response.parsedBody
  } catch (error: unknown) {
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
export const useGetCurrentUser = () =>
  useMutation({
    mutationFn: getCurrentUser,
    mutationKey: [QUERY_KEYS.CURRENT_USER],
  })
