import {useGetActiveCreatorApplication} from '@/api/creator-applications/index.ts'
import {useDisclosure} from '@/hooks/use-disclosure.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {useSearchParams} from '@remix-run/react'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from 'react'

interface IAccountContext {
  isCreatorApplicationModalOpened: boolean
  activeCreatorApplication?: CreatorApplication
}

export const AccountContext = createContext<IAccountContext>({
  isCreatorApplicationModalOpened: false,
})

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const AccountProvider = ({children}: PropsWithChildren<Props>) => {
  const {isLoggedIn} = useAuth()
  const [searchParams] = useSearchParams()
  const {
    isOpened: isCreatorApplicationModalOpened,
    onClose: onCloseCreatorApplicationModal,
    onOpen: onOpenCreatorApplicationModal,
  } = useDisclosure()
  const {data: activeCreatorApplication} = useGetActiveCreatorApplication({
    enabled: isLoggedIn,
  })

  useEffect(() => {
    const completeCreatorApplication = searchParams.get(
      'complete-creator-application',
    )
    if (completeCreatorApplication && completeCreatorApplication !== 'false') {
      onOpenCreatorApplicationModal()
    } else {
      onCloseCreatorApplicationModal()
    }
  }, [
    onCloseCreatorApplicationModal,
    onOpenCreatorApplicationModal,
    searchParams,
  ])

  return (
    <AccountContext.Provider
      value={{
        isCreatorApplicationModalOpened,
        activeCreatorApplication,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export const useAccountContext = () => useContext(AccountContext)
