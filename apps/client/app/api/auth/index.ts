import {useMutation} from '@tanstack/react-query'
import {fetchClient} from '@/lib/transport/index.ts'
import { QUERY_KEYS } from '@/constants/index.ts'

export const initiateTwitterAuth = async () => {
  const res = await fetch('/api/auth/twitter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({callbackUrl: window.location.href}),
  })
  const data = await res.json()
  return data
}

interface AuthenticateInputProps {
  type: 'GOOGLE' | 'TWITTER' | 'FACEBOOK'
  google: PossiblyUndefined<{}>
  twitter: PossiblyUndefined<{}>
  facebook: PossiblyUndefined<{}>
}

interface AuthenticateOutputProps {
  user: User
  token: string
}

export const authenticate = async (props: AuthenticateInputProps) => {
  try {
    const response = await fetchClient<AuthenticateOutputProps>(
      '/v1/authenticate',
      {
        method: 'POST',
        body: JSON.stringify(props),
        isUnAuthorizedRequest: true,
      },
    )

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
