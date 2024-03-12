/* eslint-disable react/no-unstable-nested-components */
import {Button} from '@/components/button/index.tsx'
import {TrashIcon} from '@heroicons/react/24/solid'
import {useEffect, useMemo, useRef, useState} from 'react'
import {RadioGroup} from '@headlessui/react'
import {classNames} from '@/lib/classNames.ts'
import {useMediaQuery} from '@uidotdev/usehooks'
import {useContentUpload, type Content} from '../context.tsx'
import {AddNewContentButton} from './add-new-content.tsx'
import {ContentSideViewer} from './content-side-viewer.tsx'
import {Footer} from './footer.tsx'

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

const ContentEditor = ({content}: {content: Content}) => {
  const imageUrl = useMemo(
    () => URL.createObjectURL(content.file),
    [content.file],
  )
  const isRejected = useMemo(
    () => content.status === 'rejected',
    [content.status],
  )

  return (
    <div className="flex flex-row items-center gap-4 mx-5 md:mx-0">
      <div className="w-full">
        <div className="md:hidden">
          <img src={imageUrl} alt={content.file.name} className="rounded-2xl" />
        </div>
        <div className="flex md:hidden justify-center mb-5">
          <Button
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
            <div className=" w-full col-span-1  hidden md:block">
              <img
                src={imageUrl}
                alt={content.file.name}
                className="rounded-2xl"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              {isRejected ? (
                <>
                  <h1 className="font-bold text-3xl text-red-600">Error</h1>
                  <p className="mt-2 font-medium text-red-600">
                    {content.message}
                  </p>
                  <Button externalClassName="bg-red-600 mt-5" size="xl">
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
          variant="unstyled"
          externalClassName="bg-zinc-100 rounded-full p-5 "
        >
          <TrashIcon className="h-10 w-auto text-zinc-300 hover:text-zinc-600" />
        </Button>
      </div>
    </div>
  )
}

const HeaderDetails = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="font-bold text-3xl md:text-3xl xl:text-4xl w-3/3 md:w-2/3 text-center mt-5 px-5 md:px-0">
        Make your photos easy to find and be seen.
      </h1>
      <p className="text-center w-full md:w-4/6 mt-5 text-lg md:text-base xl:text-lg px-3 md:px-0">
        The way hashtags make your content discoverable in social media, tags
        will make it easier to find on mfoni.{' '}
        <b>Add some keywords that describe your photo and what is in it</b>.
      </p>
    </div>
  )
}

export const ContentManager = () => {
  const {contents} = useContentUpload()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeContent, setActiveContent] = useState<number>(0)
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

  useEffect(() => {
    if (!isSmallDevice && scrollRef.current) {
      const element = Array.from(scrollRef.current.children)[activeContent]
      if (element) {
        element.scrollIntoView({behavior: 'smooth', block: 'nearest'})
      }
    }
  }, [activeContent, isSmallDevice])

  function scrollToPosition(contentIdx: number) {
    if (scrollRef.current) {
      const element = Array.from(scrollRef.current.children)[contentIdx]
      if (element && !isSmallDevice) {
        element.scrollIntoView({behavior: 'smooth', block: 'nearest'})
      }
      setActiveContent(contentIdx)
    }
  }

  return (
    <div className=" pt-0 md:pt-5">
      <div className="block md:hidden">
        <HeaderDetails />
      </div>
      <div className="grid grid-cols-8 gap-4 items-start mt-4 md:mt-0">
        <div className="md:sticky md:top-20 col-span-8 md:col-span-1">
          <div className="max-h-[87vh] overflow-y-auto md:pb-40 md:pl-5 scrollContainer">
            <div className=" flex flex-row md:flex-col justify-start md:justify-center items-center gap-2 md:gap-4">
              <AddNewContentButton />
              {Object.values(contents).map((content, contentIdx) => (
                <ContentSideViewer
                  activeContent={activeContent === contentIdx}
                  onSelect={() => scrollToPosition(contentIdx)}
                  content={content}
                  key={contentIdx}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-8 md:col-span-7">
          <div className="pb-10 md:pb-40 md:pr-10 ">
            <div className="hidden md:block">
              <HeaderDetails />
            </div>
            <div ref={scrollRef} className="mt-10 flex flex-col gap-4">
              {Object.values(contents).map((content, contentIdx) =>
                isSmallDevice ? (
                  activeContent == contentIdx ? (
                    <ContentEditor content={content} key={contentIdx} />
                  ) : null
                ) : (
                  <ContentEditor content={content} key={contentIdx} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer contents={Object.values(contents)} />
    </div>
  )
}
