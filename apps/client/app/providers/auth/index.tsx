/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {useGetCurrentUser} from '@/api/auth/index.ts'
import {QUERY_KEYS, USER_CIPHER} from '@/constants/index.ts'
import {auth} from '@/lib/cookies.config.ts'
import {useQueryClient} from '@tanstack/react-query'
import {type PropsWithChildren, createContext, useMemo, useContext} from 'react'
import {toast} from 'react-hot-toast'

interface AuthContextProps {
  isLoading: boolean
  isLoggedIn: boolean
  currentUser?: User
  getToken: () => Nullable<string>
  onSignin: (input: {user: User; token: string}) => void
  onSignout: () => void
}

export const AuthContext = createContext<AuthContextProps>({
  isLoading: false,
  isLoggedIn: false,
  onSignin: () => {},
  onSignout: () => {},
  getToken: () => null,
})

export const AuthProvider = ({children}: PropsWithChildren) => {
  const authCipher = auth.getCipher(USER_CIPHER)
  const queryClient = useQueryClient()

  const {data: currentUser} = useGetCurrentUser({
    enabled: Boolean(authCipher),
  })

  const authController = useMemo(
    () => ({
      onSignin: ({token}: {user: User; token: string}) => {
        auth.setCipher(USER_CIPHER, token)
      },
      onSignout: async () => {
        const token = auth.getCipher(USER_CIPHER)
        if (token) {
          auth.clearCipher(USER_CIPHER)
          queryClient.setQueryData([QUERY_KEYS.CURRENT_USER], null)
          toast.success('Logged out successfully', {id: 'logout-success'})
        }
      },
      getToken: () => {
        const token = auth.getCipher(USER_CIPHER)
        return token ?? null
      },
    }),
    [queryClient],
  )

  return (
    <AuthContext.Provider
      value={{
        ...authController,
        isLoading: false,
        currentUser,
        isLoggedIn: Boolean(authCipher),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
