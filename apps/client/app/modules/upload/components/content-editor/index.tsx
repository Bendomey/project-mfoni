import {useContentUpload} from '../../context.tsx'
import {Button} from '@/components/button/index.tsx'
import {TrashIcon} from '@heroicons/react/24/solid'
import {useEffect, useMemo} from 'react'
import {Loader} from '@/components/loader/index.tsx'
import useImageUpload from '@/hooks/use-image-upload.ts'
import {VisibilityPicker} from './visibility-picker.tsx'
import {TagsPicker} from './tags-picker.tsx'

export const ContentEditor = ({contentId}: {contentId: string}) => {
  const {contents, updateContent, deleteContent} = useContentUpload()
  const {
    upload,
    isLoading,
    abortController,
    results: uploadResults,
  } = useImageUpload()

  const content = useMemo(() => contents[contentId], [contentId, contents])
  const imageUrl = useMemo(
    () => (content ? URL.createObjectURL(content.file) : ''),
    [content],
  )
  const isRejected = useMemo(() => content?.status === 'rejected', [content])

  useEffect(() => {
    // initialize upload
    void (async () => {
      if (
        !isRejected &&
        content?.file &&
        !['uploading', 'completed'].includes(content.uploadStatus ?? '')
      ) {
        // send updates to central store
        updateContent(contentId, {uploadStatus: 'uploading'})
        await upload(content.file)
      }
    })()
  }, [isRejected, content, updateContent, contentId, upload])

  // save upload results
  useEffect(() => {
    if (uploadResults && content?.uploadStatus === 'uploading') {
      // send updates to central store
      updateContent(contentId, {
        ...content,
        uploadStatus: 'completed',
        filUploadedUrl: uploadResults.fileLink,
        eTag: uploadResults.eTag,
      })
    }
  }, [content, contentId, updateContent, uploadResults])

  const handleDelete = () => {
    abortController.abort()
    deleteContent(contentId)
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
            className={`${
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
                    className="bg-red-600 hover:bg-red-700 mt-5"
                    size="xl"
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="block font-semibold text-lg leading-6 text-gray-500"
                    >
                      Title <span className="text-gray-300">(optional)</span>
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={content?.title}
                        onChange={e =>
                          updateContent(contentId, {title: e.target.value})
                        }
                        autoComplete="off"
                        className="block w-full rounded-md border-0 py-3 placeholder:font-medium font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                        placeholder="Enter title"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="tags"
                      className="block font-semibold text-lg leading-6 text-gray-500"
                    >
                      Tags <span className="text-gray-300">(optional)</span>
                    </label>
                    <div className="mt-2">
                      <TagsPicker
                        tags={content?.tags ?? []}
                        setTags={tags => updateContent(contentId, {tags})}
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
                        value={content?.amount}
                        onChange={e =>
                          updateContent(contentId, {amount: e.target.value})
                        }
                        className="block w-full rounded-md border-0 py-3 placeholder:font-medium  font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                        placeholder="Free"
                      />
                    </div>
                  </div>

                  <div>
                    <VisibilityPicker
                      visibility={content?.visibility}
                      setVisibility={visibility =>
                        updateContent(contentId, {visibility})
                      }
                    />
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
          className="bg-zinc-100 rounded-full p-5 "
        >
          <TrashIcon className="h-10 w-auto text-zinc-300 hover:text-zinc-600" />
        </Button>
      </div>
    </div>
  )
}
