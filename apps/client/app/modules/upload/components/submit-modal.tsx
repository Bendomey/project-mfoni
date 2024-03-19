import {Fragment} from 'react'
import {Transition, Dialog} from '@headlessui/react'
import {Button} from '@/components/button/index.tsx'
import {XCircleIcon} from '@heroicons/react/20/solid'
import {useSubmitErrors} from './use-submit-errors.ts'

interface Props {
  isOpen: boolean
  onToggle: () => void
}
export const SubmitModal = ({isOpen, onToggle}: Props) => {
  const {errorMessages, isSubmittable} = useSubmitErrors()

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onToggle}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20  backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`relative w-full ${
                  isSubmittable ? 'max-w-md' : 'max-w-lg'
                } transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}
              >
                {/* <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        // onClick={() => setOpen(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div> */}
                <Dialog.Title
                  as="h1"
                  className="text-xl font-bold leading-6 text-gray-900"
                >
                  Submit your Content
                </Dialog.Title>

                <Dialog.Description>
                  <p className="text-gray-500">
                    Are you sure you want to submit these contents?
                  </p>
                </Dialog.Description>

                {isSubmittable ? null : (
                  <div className="rounded-md bg-yellow-50 p-4 mt-5">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon
                          className="h-5 w-5 text-yellow-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          {errorMessages.length === 1
                            ? 'A'
                            : errorMessages.length}{' '}
                          warning{errorMessages.length > 1 ? 's' : ''} occured
                          with your submission
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc space-y-1 pl-5">
                            {errorMessages.map((message, i) => (
                              <li key={i}>{message}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-5">
                  <Button onClick={onToggle} size="lg" variant="outline">
                    Close
                  </Button>
                  <Button disabled={!isSubmittable} size="lg">
                    Submit
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
