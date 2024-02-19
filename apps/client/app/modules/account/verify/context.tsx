import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import {type Step} from './components/steps.tsx'
import {useAuth} from '@/providers/auth/index.tsx'
import {toast} from 'react-hot-toast'
import {useNavigate} from '@remix-run/react'
import {Loader} from '@/components/loader/index.tsx'

interface VerifyCreatorContextProps {
  activeStep: Step
  setActiveStep: Dispatch<SetStateAction<Step>>
}

const VerifyCreatorContext = createContext<VerifyCreatorContextProps>({
  activeStep: 'phone',
  setActiveStep: () => {},
})

export const VerifyCreatorProvider = ({children}: PropsWithChildren) => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState<Step>('phone')

  const {getToken, currentUser, isLoading} = useAuth()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate(`/auth?return_to=${window.location}`)
      toast.error('Kindly login to access page', {id: 'login-to-access-page'})
      return
    }

    const isCreatorApplicationApproved =
      currentUser?.creatorApplication &&
      (currentUser.creatorApplication as CreatorApplication).status ===
        'APPROVED'

    if (isCreatorApplicationApproved) {
      setActiveStep('welcome')
    } else if (currentUser?.verifiedPhoneNumberAt) {
      setActiveStep('id')
    }
  }, [currentUser, getToken, navigate])

  if (isLoading && currentUser) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Loader />
      </div>
    )
  }

  return (
    <VerifyCreatorContext.Provider
      value={{
        activeStep,
        setActiveStep,
      }}
    >
      {children}
    </VerifyCreatorContext.Provider>
  )
}

export const useVerifyCreator = () => {
  const context = useContext(VerifyCreatorContext)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error('useVerifyCreator must be used within VerifyCreatorContext')
  }

  return context
}
