import {Button} from '@/components/button/index.tsx'
import {APP_NAME} from '@/constants/index.ts'
import {ArrowLeftIcon} from '@heroicons/react/24/outline'
import {type Step, Steps} from './components/steps.tsx'
import {useMemo} from 'react'
import {VerifyPhoneStep} from './components/verify-phone-step/index.tsx'
import {classNames} from '@/lib/classNames.ts'
import {WelcomeStep} from './components/welcome-step/index.tsx'
import {VerifyCreatorProvider, useVerifyCreator} from './context.tsx'
import { VerifyEmailStep } from './components/verify-email-step/index.tsx'

const StepComponents: Record<Step, () => JSX.Element> = {
  phone: VerifyPhoneStep,
  email: VerifyEmailStep,
  welcome: WelcomeStep,
}

const steps = Object.keys(StepComponents)

const VerifyAccount = () => {
  const {activeStep} = useVerifyCreator()

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
                className="flex flex-row items-end justify-start w-auto mb-5"
              >
                <span className="text-3xl text-blue-700 font-extrabold">
                  {APP_NAME.slice(0, 1)}
                </span>
                <span className="text-3xl text-black font-extrabold">
                  {APP_NAME.slice(1)}
                </span>
              </Button>

              <div className="mt-20">
                <Steps activeStep={activeStep} />
              </div>
            </div>

            <div className="mb-5">
              <Button
                variant="unstyled"
                isLink
                href="/account"
                className="font-bold text-sm"
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
          <Button isLink href='/' variant='unstyled' className="mb-10 block md:hidden">
            <span className="text-3xl text-blue-700 font-extrabold">
              {APP_NAME.slice(0, 1)}
            </span>
            <span className="text-3xl text-black font-extrabold">
              {APP_NAME.slice(1)}
            </span>
          </Button>
        </div>
        <div className="w-[80vw] md:w-[50vw] xl:w-[40vw] ">
          <Step />
        </div>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-4 gap-2 w-[50vw] md:w-[17vw]">
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

export const VerifyAccountModule = () => {
  return (
    <VerifyCreatorProvider>
      <VerifyAccount />
    </VerifyCreatorProvider>
  )
}
