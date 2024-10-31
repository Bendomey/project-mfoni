import {Button} from '@/components/button/index.tsx'
import {APP_NAME} from '@/constants/index.ts'
import {ArrowRightIcon} from '@heroicons/react/24/solid'
import {useNavigate} from '@remix-run/react'
import creatorImage from '@/assets/creator.jpg'
import userImage from '@/assets/user.jpeg'
import {useCallback, useEffect, useState} from 'react'
import {useDisclosure} from '@/hooks/use-disclosure.tsx'
import {SetupAccountModal} from './setup-modal/index.tsx'
import {ArrowLeftIcon} from '@heroicons/react/20/solid'
import {TypewriterEffectSmooth} from '@/components/animation/TypeWriteEffect.tsx'
import {useAuth} from '@/providers/auth/index.tsx'

const words = [
  {
    text: 'What',
  },
  {
    text: 'is',
  },
  {
    text: 'your',
  },
  {
    text: 'primary',
  },
  {
    text: 'goal?',
  },
]

export const OnboardingModule = () => {
  const [selectedType, setSelected] = useState<UserRole>()
  const {onToggle, isOpened} = useDisclosure()
  const {currentUser, getToken, onSignout} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser?.role) {
      navigate('/account')
    }
  }, [currentUser, getToken, navigate])

  const handleContinue = useCallback(() => {
    onToggle()
  }, [onToggle])

  return (
    <>
      <div className="h-screen w-full flex flex-col relative">
        <div className="border-b border-zinc-200 px-5 md:px-10 py-5 flex flex-row items-center justify-between">
          <button
            onClick={() => {
              onSignout()
              navigate('/auth')
            }}
            className="ml-2 flex flex-row items-center"
          >
            <ArrowLeftIcon className="h-7 w-7 text-zinc-600" />
            <div className="flex flex-row items-end ml-2">
              <span className="text-4xl text-blue-700 font-extrabold">
                {APP_NAME.slice(0, 1)}
              </span>
              <span className="text-4xl font-extrabold">
                {APP_NAME.slice(1)}
              </span>
            </div>
          </button>
          <div>
            {selectedType ? (
              <Button
                onClick={handleContinue}
                size="lg"
                variant="outlined"
                className="hidden md:flex"
              >
                Continue{' '}
                <ArrowRightIcon className="h-5 w-5 text-zinc-600 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="h-full bg-zinc-50 flex flex-col justify-center items-center">
          {/* <h1 className="font-bold  text-center text-4xl w-2/3 md:w-auto md:text-5xl">
            What is your primary goal?
          </h1> */}
          <TypewriterEffectSmooth words={words} />
          <div className="my-10 w-3/3 sm:w-3/3 md:w-2/3 px-5 md:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <button
                onClick={() => setSelected('CLIENT')}
                type="button"
                className={`flex flex-col flex-start border-2 hover:bg-zinc-100 ${
                  selectedType === 'CLIENT'
                    ? 'border-zinc-600'
                    : 'border-dashed border-zinc-300'
                } p-5 rounded-lg`}
              >
                <img
                  className="hidden md:block rounded-lg max-w-full h-auto"
                  src={userImage}
                  alt="I'm here to download photos and videos"
                />
                <div className="mt-0 md:mt-4">
                  <h3 className="font-bold text-2xl text-start">User</h3>
                  <h3 className="text-zinc-500 text-start">
                    I&apos;m here to download photos and videos.
                  </h3>
                </div>
              </button>
              <button
                onClick={() => setSelected('CREATOR')}
                type="button"
                className={`flex flex-col flex-start  hover:bg-zinc-100 border-2 ${
                  selectedType === 'CREATOR'
                    ? 'border-zinc-600'
                    : 'border-dashed border-zinc-300'
                } p-5 rounded-lg cursor-pointer`}
              >
                <img
                  className="hidden md:block rounded-lg max-w-full h-auto"
                  src={creatorImage}
                  alt="I'm here to share my photos and videos with the world"
                />
                <div className="mt-0 md:mt-4">
                  <h3 className="font-bold text-2xl text-start">Creator</h3>
                  <h3 className="text-zinc-500 text-start">
                    I&apos;m here to share my photos and videos with the world.
                  </h3>
                </div>
              </button>
            </div>
            {selectedType ? (
              <Button
                size="lg"
                onClick={handleContinue}
                variant="outlined"
                className="flex md:hidden justify-center mt-10 w-full"
              >
                Continue{' '}
                <ArrowRightIcon className="h-5 w-5 text-zinc-600 ml-2" />
              </Button>
            ) : null}
          </div>
          <div className="w-5/6 md:w-3/6">
            <p className="text-center font-medium text-zinc-500">
              We’ll use this info to personalize your experience. You’ll always
              be able to both download and upload photos and videos, no matter
              which option you choose.
            </p>
          </div>
        </div>
      </div>
      <SetupAccountModal
        open={isOpened}
        onClose={onToggle}
        selectedType={selectedType}
      />
    </>
  )
}
