import { Button } from '@/components/button/index.tsx'
import { APP_NAME } from '@/constants/index.ts'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { type Step, Steps } from './components/steps.tsx'
import { useEffect, useMemo, useState } from 'react'
import { VerifyPhoneStep } from './components/verify-phone-step/index.tsx'
import { VerifyIdStep } from './components/verify-id-step/index.tsx'
import { classNames } from '@/lib/classNames.ts'
import { WelcomeStep } from './components/welcome-step/index.tsx'
import { useAuth } from '@/providers/auth/index.tsx'
import { useNavigate } from '@remix-run/react'
import {toast} from 'react-hot-toast'

const StepComponents: Record<Step, () => JSX.Element> = {
  phone: VerifyPhoneStep,
  id: VerifyIdStep,
  welcome: WelcomeStep,
}

const steps = Object.keys(StepComponents)

export const VerifyAccountModule = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState<Step>('phone')
  const { isLoggedIn, currentUser } = useAuth()

  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      navigate(`/auth?return_to=${window.location}`)
      toast.error("Kindly login to access page", {id: "login-to-access-page"})
      return
    }

    const isCreatorApplicationNotApproved = (currentUser.creatorApplication as CreatorApplication).status !== "APPROVED"
    
    if(isCreatorApplicationNotApproved){
      navigate(`/account`)
      toast.success("You're already an approved creator", {id: "already-approved-creator"})
    }

  }, [currentUser, isLoggedIn, navigate])

  const Step = useMemo(() => StepComponents[activeStep], [activeStep])

  return (
    <div className="flex h-screen flex-1">
      <div className="relative hidden w-1/3 lg:block">
        <div className="absolute top-0 z-1  w-full h-full p-5">
          <div className="flex flex-col h-full justify-between bg-zinc-50 rounded-2xl px-7 py-5">
            <div>
              <Button
                variant="unstyled"
                isLink
                href="/"
                externalClassName="flex flex-row items-end mb-5"
              >
                <span className="text-3xl text-blue-700 font-extrabold">
                  {APP_NAME.slice(0, 1)}
                </span>
                <span className="text-3xl text-black font-extrabold">
                  {APP_NAME.slice(1)}
                </span>
              </Button>

              <div className="mt-20">
                <Steps activeStep={activeStep} onChange={setActiveStep} />
              </div>
            </div>

            <div className="mb-5">
              <Button
                variant="unstyled"
                isLink
                href="/account"
                externalClassName="flex flex-row items-center font-bold text-sm"
              >
                <ArrowLeftIcon className="h-4 w-auto text-black mr-2" /> Back to
                home
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col w-2/3 justify-between items-center px-4 py-7 md:py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div>
          <div className="mb-10 block md:hidden">
            <span className="text-3xl text-blue-700 font-extrabold">
              {APP_NAME.slice(0, 1)}
            </span>
            <span className="text-3xl text-black font-extrabold">
              {APP_NAME.slice(1)}
            </span>
          </div>
        </div>
        <div className="w-[80vw] md:w-[25vw] ">
          <Step />
        </div>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-2 w-[50vw] md:w-[17vw]">
            {steps.map((step, i) => (
              <div
                className={classNames(
                  'h-2 w-ful rounded-lg',
                  step === activeStep ? 'bg-blue-600' : 'bg-zinc-200',
                )}
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
