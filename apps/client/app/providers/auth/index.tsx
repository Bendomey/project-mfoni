import { useGetActiveCreatorApplication } from '@/api/creator-applications/index.ts'
import { USER_CIPHER } from '@/constants/index.ts'
import { auth } from '@/lib/cookies.config.ts'
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
  onSignin: (input: { user: User; token: string }) => void
  onSignout: () => void
  isNotVerified: boolean
  activeSubcription?: CreatorSubscription
  activeCreatorApplication?: CreatorApplication
}

export const AuthContext = createContext<AuthContextProps>({
  isLoading: false,
  isLoggedIn: false,
  onSignin: () => { },
  onSignout: () => { },
  getToken: () => null,
  currentUser: null,
  onUpdateUser: () => { },
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
  const isLoggedIn = Boolean(authCipher);
  const [currentUser, setCurrentUser] = useState<User | null>(() => authData)

  const { data: activeCreatorApplication } = useGetActiveCreatorApplication({
    enabled: isLoggedIn && currentUser?.role === "CLIENT",
  })

  const authController = useMemo(
    () => ({
      onSignin: ({ user, token }: { user: User; token: string }) => {
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

  const activeSubcription = useMemo(() => {
    if (currentUser?.creator?.subscription) {
      return currentUser.creator.subscription
    }
  }, [currentUser])

  return (
    <AuthContext.Provider
      value={{
        ...authController,
        isLoading: false,
        currentUser,
        isLoggedIn: Boolean(authCipher),
        isNotVerified:
          !currentUser?.phoneNumberVerifiedAt || !currentUser.emailVerifiedAt,
        activeSubcription,
        activeCreatorApplication,
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
