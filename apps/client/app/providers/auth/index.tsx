import {USER_CIPHER} from '@/constants/index.ts'
import {auth} from '@/lib/cookies.config.ts'
import {type PropsWithChildren, createContext, useMemo, useContext} from 'react'

interface AuthContextProps {
  isLoading: boolean
  isLoggedIn: boolean
  currentUser: User | null
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
  currentUser: null,
})

interface Props {
  authData: User | null
}

export const AuthProvider = ({
  children,
  authData: currentUser,
}: PropsWithChildren<Props>) => {
  const authCipher = auth.getCipher(USER_CIPHER)

  const authController = useMemo(
    () => ({
      onSignin: ({token}: {user: User; token: string}) => {
        auth.setCipher(USER_CIPHER, token)
      },
      onSignout: async () => {
        auth.clearCipher(USER_CIPHER)
      },
      getToken: () => {
        const token = auth.getCipher(USER_CIPHER)
        return token ?? null
      },
    }),
    [],
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
