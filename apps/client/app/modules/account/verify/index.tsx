import {Button} from '@/components/button/index.tsx'
import {APP_NAME} from '@/constants/index.ts'
import {ArrowLeftIcon} from '@heroicons/react/24/outline'
import {type Step, Steps} from './components/steps.tsx'
import {useState} from 'react'

export const VerifyAccountModule = () => {
  const [activeStep, setActiveStep] = useState<Step>('name')

  return (
    <div className="flex h-screen flex-1">
      <div className="relative hidden w-1/3 lg:block">
        <div className="absolute top-0 z-1  w-full h-full p-5">
          <div className="flex flex-col h-full justify-between bg-zinc-50 rounded-2xl px-7 py-5">
            <div>
              <div className="flex flex-row items-end mb-5">
                <span className="text-3xl text-blue-700 font-extrabold">
                  {APP_NAME.slice(0, 1)}
                </span>
                <span className="text-3xl text-black font-extrabold">
                  {APP_NAME.slice(1)}
                </span>
              </div>

              <div className="mt-20">
                <Steps activeStep={activeStep} onChange={setActiveStep} />
              </div>
            </div>

            <div className="mb-5">
              <Button
                variant="unstyled"
                externalClassName="flex flex-row items-center font-bold text-sm"
              >
                <ArrowLeftIcon className="h-4 w-auto text-black mr-2" /> Back to
                home
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col w-2/3 justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        hello world
      </div>
    </div>
  )
}
