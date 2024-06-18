/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {useContext, createContext, useState, useCallback, useMemo} from 'react'
import {useDropzone, type FileRejection} from 'react-dropzone-esm'
import {acceptFile, getErrorMessageForRejectedFiles} from './utils.ts'
import {v4} from 'uuid'
import {megabytesToBytes} from '@/lib/image-fns.ts'
import {toast} from 'react-hot-toast'
import {Header} from '@/components/layout/index.ts'
import {ContentManager} from './components/contents-manager.tsx'
import {ContentUploader} from './components/content-uploader.tsx'

// 30 MB
const MAX_SIZE = 30
const MAX_FILES = 10

export interface Content {
  id: string
  file: File
  status: 'accepted' | 'rejected'
  uploadStatus?: 'uploading' | 'completed' | 'failed'
  message: string
  filUploadedUrl?: string
  progress?: number
}

export interface ContentUploadContext {
  contents: {[id: string]: Content}
  setContents: React.Dispatch<
    React.SetStateAction<{
      [id: string]: Content
    }>
  >
  openFileSelector: VoidFunction
  isSubmitting: boolean
}

const ContentUploadContext = createContext<ContentUploadContext>({
  contents: {},
  setContents: () => {},
  openFileSelector: () => {},
  isSubmitting: false,
})

export const ContentUploadProvider = () => {
  const [contents, setContents] = useState<ContentUploadContext['contents']>({})

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const newContents: {[id: string]: Content} = {}

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        if (file) {
          const isDuplicate = Object.values(contents).find(
            content => content.file.name === file.name,
          )
          if (isDuplicate) {
            continue
          }

          // eslint-disable-next-line no-await-in-loop
          const validationResponse = await acceptFile(file)
          const contentId = v4()
          newContents[contentId] = validationResponse as Content
        }
      }
      setContents(prevContents => ({...newContents, ...prevContents}))

      if (fileRejections.length) {
        if (fileRejections?.[0]?.errors?.[0]?.code) {
          toast.error(
            getErrorMessageForRejectedFiles(
              fileRejections?.[0]?.errors?.[0]?.code,
            ),
          )
        }
      }
    },
    [contents, setContents],
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileSelector,
  } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: MAX_FILES - Object.keys(contents).length,
    maxSize: megabytesToBytes(MAX_SIZE),
  })

  const areContentsAdded = useMemo(
    () => Boolean(Object.values(contents).length),
    [contents],
  )

  return (
    <ContentUploadContext.Provider
      value={{contents, setContents, openFileSelector, isSubmitting: false}}
    >
      <div {...getRootProps()} className="relative">
        <Header isHeroSearchInVisible={false} />
        <input {...getInputProps()} />

        {areContentsAdded ? <ContentManager /> : <ContentUploader />}

        {isDragActive ? (
          <div className="fixed h-screen w-screen overflow-hidden top-0 z-50 bg-black bg-opacity-70   backdrop-blur flex justify-center items-center">
            <h1 className="font-extrabold text-white text-6xl">
              Drop your images here.
            </h1>
          </div>
        ) : null}
      </div>
    </ContentUploadContext.Provider>
  )
}

export const useContentUpload = () => {
  const context = useContext(ContentUploadContext)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      'useContextUpload must be used within a ContentUploadProvider',
    )
  }

  return context
}
