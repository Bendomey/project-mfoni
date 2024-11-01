import {USER_CIPHER} from '@/constants/index.ts'
import {auth} from '@/lib/cookies.config.ts'
import {
  type PropsWithChildren,
  createContext,
  useMemo,
  useContext,
  useState,
} from 'react'

interface AuthContextProps {
  isLoading: boolean
  isLoggedIn: boolean
  currentUser: User | null
  getToken: () => Nullable<string>
  onUpdateUser: (user: User) => void
  onSignin: (input: {user: User; token: string}) => void
  onSignout: () => void
  isNotVerified: boolean
}

export const AuthContext = createContext<AuthContextProps>({
  isLoading: false,
  isLoggedIn: false,
  onSignin: () => {},
  onSignout: () => {},
  getToken: () => null,
  currentUser: null,
  onUpdateUser: () => {},
  isNotVerified: false,
})

interface Props {
  authData: User | null
}

export const AuthProvider = ({
  children,
  authData,
}: PropsWithChildren<Props>) => {
  const authCipher = auth.getCipher(USER_CIPHER)
  const [currentUser, setCurrentUser] = useState<User | null>(() => authData)

  const authController = useMemo(
    () => ({
      onSignin: ({user, token}: {user: User; token: string}) => {
        setCurrentUser(user)
        auth.setCipher(USER_CIPHER, token)
      },
      onSignout: async () => {
        auth.clearCipher(USER_CIPHER)
      },
      onUpdateUser: async (user: User) => {
        setCurrentUser(user)
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
        isNotVerified:
          !currentUser?.phoneNumberVerifiedAt || !currentUser.emailVerifiedAt,
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
