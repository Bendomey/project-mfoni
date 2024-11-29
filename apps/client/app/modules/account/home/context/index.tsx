import {useGetActiveCreatorApplication} from '@/api/creator-applications/index.ts'
import {useAuth} from '@/providers/auth/index.tsx'
import {createContext, type PropsWithChildren, useContext} from 'react'

interface IAccountContext {
  activeCreatorApplication?: CreatorApplication
}

export const AccountContext = createContext<IAccountContext>({})

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const AccountProvider = ({children}: PropsWithChildren<Props>) => {
  const {isLoggedIn} = useAuth()
  const {data: activeCreatorApplication} = useGetActiveCreatorApplication({
    enabled: isLoggedIn,
  })

  return (
    <AccountContext.Provider
      value={{
        activeCreatorApplication,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export const useAccountContext = () => useContext(AccountContext)
