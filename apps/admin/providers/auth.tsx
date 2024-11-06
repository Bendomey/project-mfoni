"use client"

import {auth} from '@/lib'
import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {USER_CIPHER} from '@/constants/misc'
import {UNAUTH_ROUTES} from '@/constants/pages'
import { LoginOutputProps, useGetCurrentAdmin } from '@/api'
import { useToast } from '@/hooks/use-toast'
import { LoadingContainer } from '@/components/LoadingContainer'

interface ContextState {
  userData?: Admin
  token?: string
  signIn: (data: LoginOutputProps) => void
  signOut: () => void
}

export const AuthContext = React.createContext<ContextState>({
  signIn: (data: LoginOutputProps) => {},
  signOut: () => {},
})

const UNAUTHENTICATED_ROUTES: Array<string> = Object.values(UNAUTH_ROUTES)

export const AuthProvider = ({children}: React.PropsWithChildren) => {
  const [pageLoading, setpageLoading] = React.useState(true)
  const [state, setState] = React.useState<Partial<ContextState> | null>(null)
  const Router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const {mutate, data, isPending: isLoadingAdmin} = useGetCurrentAdmin()

  React.useEffect(() => {
    (async () => {
      let userToken: {token: string} | undefined =
        auth.getCipher(USER_CIPHER)

      if (userToken) {
        mutate(
          {},
          {
            onSuccess: data => {
              if (data) {
                setState({userData: data.data, token: userToken.token})
              }
            },
            onError: e => {
              toast({
                title: "Session Expired",
                variant: "destructive",
                description: 'Login to access resource',
                duration: 5000,
              });
              Router.replace(`/login`)
            },
          },
        )
      } else {
        if (!UNAUTHENTICATED_ROUTES.includes(pathname)) {
          toast({
            title: "Session Expired",
            variant: "destructive",
            description: 'Login to access resource',
            duration: 5000,
          });
          Router.replace(`/login?redirect_to=${pathname}`)
        }
      }
      setpageLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //control the signing-in and signing-out of the system
  const authContextController = React.useMemo(
    () => ({
      signIn: async (loginInput: LoginOutputProps): Promise<boolean> => {
        return new Promise((resolve, reject) => {
          auth.setCipher(USER_CIPHER, loginInput.token
        )
          setState({token: loginInput.token})
          resolve(true)
        })
      },
      signOut: (): void => {
        auth.clearCipher(USER_CIPHER)
        setState(null)
      },
    }),
    [],
  )

  const isPageReady = pageLoading || isLoadingAdmin

  return (
    <>
      {isPageReady ? (
        <LoadingContainer size='full'/>
      ) : (
        <AuthContext.Provider value={{...authContextController, ...state}}>
          {children}
        </AuthContext.Provider>
      )}
    </>
  )
}

export const useCurrentUser = () => React.useContext(AuthContext)
