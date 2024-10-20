import {Button} from '@/components/button/index.tsx'
import {useMemo} from 'react'
import {type Content} from '../context.tsx'
import {ExclamationCircleIcon} from '@heroicons/react/24/solid'
import {SubmitModal} from './submit-modal.tsx'
import {useDisclosure} from '@/hooks/use-disclosure.tsx'

const CircularProgress = ({progress}: {progress: number}) => {
  const circumference = ((2 * 22) / 7) * 15
  return (
    <div className="flex items-center justify-center ">
      <svg className="transform -rotate-90 w-10 h-10">
        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          className="text-zinc-200"
        />

        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          className="text-emerald-700 "
        />
      </svg>
    </div>
  )
}

export const Footer = ({contents}: {contents: Array<Content>}) => {
  const {isOpened: isOpenSubmitModal, onToggle: onToggleSubmitModal} =
    useDisclosure()
  const rejectedContentLength = useMemo(
    () => contents.filter(content => content.status === 'rejected').length,
    [contents],
  )

  const contentLength = useMemo(() => contents.length, [contents])
  const acceptedContentsLength = useMemo(
    () => contentLength - rejectedContentLength,
    [contentLength, rejectedContentLength],
  )

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-10 bg-blue-50 flex justify-center border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 mx-6 md:mx-12 py-5 md:py-10 w-full">
          <div>
            <div className="flex flex-row gap-3">
              <div className="flex flex-row gap-2 items-center">
                <CircularProgress
                  progress={Math.ceil(
                    (acceptedContentsLength / contentLength) * 100,
                  )}
                />
                <div className="block md:hidden text-emerald-800 font-bold">
                  {acceptedContentsLength} / {contentLength}
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-emerald-700 font-bold text-xl">
                  Content uploaded
                </h1>
                <h1 className="font-semibold text-emerald-500  mt-1">
                  {acceptedContentsLength} of {contentLength} photos and videos
                  are uploaded
                </h1>
              </div>
            </div>
          </div>
          <div>
            {rejectedContentLength > 0 ? (
              <div className="flex flex-row gap-3">
                <div className="flex flex-row gap-2 items-center">
                  <ExclamationCircleIcon className="text-red-600 h-9 w-auto" />
                  <div className="block md:hidden text-red-600 font-bold">
                    {rejectedContentLength} / {contentLength}
                  </div>
                </div>
                <div className="hidden md:block">
                  <h1 className="text-red-600 font-bold text-xl">
                    Content failed
                  </h1>
                  <h1 className="font-semibold text-red-400 mt-1">
                    {rejectedContentLength} of {contentLength} photos are
                    uploaded
                  </h1>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onToggleSubmitModal}
              size="xl"
              className="flex flex-row items-center"
            >
              Submit{' '}
              <span className="hidden md:block ml-1.5">your content</span>
            </Button>
          </div>
        </div>
      </div>

      <SubmitModal isOpen={isOpenSubmitModal} onToggle={onToggleSubmitModal} />
    </>
  )
}
