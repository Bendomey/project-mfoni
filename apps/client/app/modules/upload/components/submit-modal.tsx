import {Fragment, useMemo} from 'react'
import {Transition, Dialog} from '@headlessui/react'
import {Button} from '@/components/button/index.tsx'
import {XCircleIcon} from '@heroicons/react/20/solid'
import {useSubmitErrors} from './use-submit-errors.ts'
import {useContentUpload} from '../context.tsx'
import {Form} from '@remix-run/react'
import {type CreateContentInput} from '@/api/contents/index.ts'
import {safeString} from '@/lib/strings.ts'

interface Props {
  isOpen: boolean
  onToggle: () => void
}
export const SubmitModal = ({isOpen, onToggle}: Props) => {
  const {errorMessages, isSubmittable} = useSubmitErrors()
  const {contents, isSubmitting} = useContentUpload()

  const isSubmitButtonDisabled = useMemo(
    () => !isSubmittable || isSubmitting,
    [isSubmittable, isSubmitting],
  )

  // Request to be sent for processing.
  const submittableData: CreateContentInput = useMemo(
    () =>
      Object.values(contents).map(content => {
        const fileUrl = content.filUploadedUrl ?? ''
        const fileKey = fileUrl.split('/').pop() ?? ''
        return {
          title: safeString(content.title),
          tags: content.tags?.filter(tag => Boolean(safeString(tag))),
          visibility: content.visibility,
          amount: Boolean(content.amount) ? Number(content.amount) : 0,
          content: {
            key: fileKey,
            location: safeString(content.filUploadedUrl),
            bucket: '', // Don't want to expose the bucket name so I'll pass that on the server side
            eTag: safeString(content.eTag),
            serverSideEncryption: 'AES256',
            orientation: content.orientation,
            size: content.size,
          },
        }
      }),
    [contents],
  )

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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

                <Form method="post" encType="multipart/form-data">
                  <input
                    type="hidden"
                    name="contents"
                    defaultValue={JSON.stringify(submittableData)}
                  />
                  <div className="flex justify-end gap-3 mt-5">
                    {isSubmitting ? null : (
                      <Button onClick={onToggle} size="lg" variant="outlined">
                        Close
                      </Button>
                    )}
                    <Button
                      disabled={isSubmitButtonDisabled}
                      type="submit"
                      size="lg"
                    >
                      Submit
                    </Button>
                  </div>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
