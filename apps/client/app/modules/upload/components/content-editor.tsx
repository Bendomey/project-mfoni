import {useContentUpload} from '../context.tsx'
import {Button} from '@/components/button/index.tsx'
import {TrashIcon} from '@heroicons/react/24/solid'
import {useEffect, useMemo, useState} from 'react'
import {RadioGroup} from '@headlessui/react'
import {classNames} from '@/lib/classNames.ts'
import {Loader} from '@/components/loader/index.tsx'
import useImageUpload from '@/hooks/use-image-upload.ts'

const memoryOptions = [
  {name: 'PUBLIC', inStock: true},
  {name: 'PRIVATE', inStock: true},
]

function VisibilitySetter() {
  const [mem, setMem] = useState(memoryOptions[0])

  return (
    <div>
      <div className="">
        <label
          htmlFor="email"
          className="block font-semibold text-lg leading-6 text-gray-500"
        >
          Visibility
        </label>
        <small>
          Users will still find it by visual search if it&apos;s private.
        </small>
      </div>

      <RadioGroup value={mem} onChange={setMem} className="mt-2">
        <RadioGroup.Label className="sr-only">
          Choose a memory option
        </RadioGroup.Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ">
          {memoryOptions.map(option => (
            <RadioGroup.Option
              key={option.name}
              value={option}
              className={({active, checked}) =>
                classNames(
                  'cursor-pointer focus:outline-none',
                  active ? 'ring-2 ring-blue-600 ring-offset-2' : '',
                  checked
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                  'flex items-center justify-center rounded-md py-3 px-3 text-sm font-bold uppercase sm:flex-1',
                )
              }
              disabled={!option.inStock}
            >
              <RadioGroup.Label as="span">{option.name}</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export const ContentEditor = ({contentId}: {contentId: string}) => {
  const {contents, setContents} = useContentUpload()
  const content = contents[contentId]
  const {upload, isLoading, abortController} = useImageUpload()

  const imageUrl = useMemo(
    () => (content ? URL.createObjectURL(content.file) : ''),
    [content],
  )
  const isRejected = useMemo(() => content?.status === 'rejected', [content])

  useEffect(() => {
    void (async () => {
      if (
        !isRejected &&
        content?.file &&
        !['uploading', 'completed'].includes(content.uploadStatus ?? '')
      ) {
        // send updates to central store
        setContents(prev => {
          return {
            ...prev,
            [contentId]: {
              ...content,
              uploadStatus: 'uploading',
            },
          }
        })
        const filUploadedUrl = await upload(content.file)

        setContents(prev => {
          return {
            ...prev,
            [contentId]: {
              ...content,
              uploadStatus: 'completed',
              filUploadedUrl,
            },
          }
        })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const handleDelete = () => {
    abortController.abort()
    setContents(prev => {
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== contentId),
      )
    })
  }

  return (
    <div className="flex flex-row items-center gap-4 mx-5 md:mx-0">
      <div className="w-full">
        <div className="md:hidden">
          <img
            src={imageUrl}
            alt={content?.file.name}
            className="rounded-2xl"
          />
        </div>
        <div className="flex md:hidden justify-center mb-5">
          <Button
            onClick={handleDelete}
            externalClassName={`${
              isRejected ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-600'
            }  font-bold mt-5`}
            size="xl"
          >
            Delete this Photo
          </Button>
        </div>
        <div
          className={`${
            isRejected ? 'bg-red-50' : 'bg-zinc-100'
          } rounded-3xl py-10 px-10 md:px-16`}
        >
          <div className="grid grid-cols-2 gap-10 items-center ">
            <div className="relative w-full col-span-1  hidden md:block">
              <img
                src={imageUrl}
                alt={content?.file.name}
                className="rounded-2xl"
              />
              {isLoading ? (
                <div className="absolute animate-pulse top-0 right-0 bg-black bg-opacity-70 h-full w-full flex justify-center items-center rounded-2xl">
                  <Loader color="fill-white" size="20" />
                </div>
              ) : null}
            </div>
            <div className="col-span-2 md:col-span-1">
              {isRejected ? (
                <>
                  <h1 className="font-bold text-3xl text-red-600">Error</h1>
                  <p className="mt-2 font-medium text-red-600">
                    {content?.message}
                  </p>
                  <Button
                    onClick={handleDelete}
                    externalClassName="bg-red-600 hover:bg-red-700 mt-5"
                    size="xl"
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-semibold text-lg leading-6 text-gray-500"
                    >
                      Title <span className="text-gray-300">(optional)</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="block w-full rounded-md border-0 py-3 placeholder:font-medium font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                        placeholder="Enter title"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-semibold text-lg leading-6 text-gray-500"
                    >
                      Tags <span className="text-gray-300">(optional)</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="block w-full rounded-md border-0 py-3 placeholder:font-medium  font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                        placeholder="Enter Tags"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block font-semibold text-lg leading-6 text-gray-500"
                    >
                      Amount <span className="text-gray-300">(optional)</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        name="number"
                        id="amount"
                        step={0.01}
                        min={0}
                        className="block w-full rounded-md border-0 py-3 placeholder:font-medium  font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                        placeholder="Free"
                      />
                    </div>
                  </div>

                  <div>
                    <VisibilitySetter />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <Button
          onClick={handleDelete}
          variant="unstyled"
          externalClassName="bg-zinc-100 rounded-full p-5 "
        >
          <TrashIcon className="h-10 w-auto text-zinc-300 hover:text-zinc-600" />
        </Button>
      </div>
    </div>
  )
}
