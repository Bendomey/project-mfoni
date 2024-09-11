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
import {
  type CreateContentInput,
  useCreateContent,
} from '@/api/contents/index.ts'
import {useNavigate} from '@remix-run/react'
import {safeString} from '@/lib/strings.ts'
import {useEnvContext} from '@/providers/env/index.tsx'

// 30 MB
const MAX_SIZE = 30
const MAX_FILES = 10

export interface Content {
  // image related fields
  id: string
  file: File
  status: 'accepted' | 'rejected' // if the asset passed validation and is accepted to be uploaded or not.
  uploadStatus?: 'uploading' | 'completed' | 'failed'
  message: string
  filUploadedUrl?: string
  progress?: number
  eTag?: string | null

  // other fields
  tags?: string[]
  amount?: string
  title?: string
  visibility: IContentVisibility
}

interface Contents {
  [id: string]: Content
}

export interface ContentUploadContext {
  contents: Contents
  setContents: React.Dispatch<
    React.SetStateAction<{
      [id: string]: Content
    }>
  >
  openFileSelector: VoidFunction
  isSubmitting: boolean
  submit: VoidFunction
  updateContent: (contentId: string, data: Partial<Content>) => void
  deleteContent: (contentId: string) => void
}

const ContentUploadContext = createContext<ContentUploadContext>({
  contents: {},
  setContents: () => {},
  openFileSelector: () => {},
  isSubmitting: false,
  submit: () => {},
  updateContent: () => {},
  deleteContent: () => {},
})

export const ContentUploadProvider = () => {
  const navigate = useNavigate()
  const [contents, setContents] = useState<ContentUploadContext['contents']>({})
  const {mutate, isPending} = useCreateContent()
  const env = useEnvContext()

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
          newContents[contentId] = {
            ...(validationResponse as Content),
            visibility: 'PUBLIC',
          }
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

  const updateContent = (id: string, data: Partial<Content>) => {
    const newContents: {[id: string]: Content} = {...contents}
    const content = newContents[id]
    if (content) {
      newContents[id] = {...content, ...data}
    }
    setContents(newContents)
  }

  const deleteContent = useCallback(
    (contentId: string) =>
      setContents(prev => {
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== contentId),
        )
      }),
    [setContents],
  )

  const handleSubmit = () => {
    const submittableData: CreateContentInput = Object.values(contents).map(
      content => {
        const fileUrl = content.filUploadedUrl ?? ''
        const fileKey = fileUrl.split('/').pop() ?? ''
        return {
          title: Boolean(safeString(content.title))
            ? safeString(content.title)
            : undefined,
          tags: content.tags?.filter(tag => Boolean(safeString(tag))),
          visibility: content.visibility,
          amount: Boolean(content.amount) ? Number(content.amount) : 0,
          content: {
            key: fileKey,
            location: safeString(content.filUploadedUrl),
            bucket: env.BUCKET,
            eTag: safeString(content.eTag),
            serverSideEncryption: 'AES256',
          },
        }
      },
    )

    mutate(submittableData, {
      onSuccess: () => {
        toast.success('Upload was successful', {id: 'success-content-upload'})
        navigate('/account')
      },
      onError: () => {
        toast.error('Upload failed. Try again later.', {
          id: 'error-content-upload',
        })
      },
    })
  }

  return (
    <ContentUploadContext.Provider
      value={{
        contents,
        setContents,
        updateContent,
        deleteContent,
        openFileSelector,
        isSubmitting: isPending,
        submit: handleSubmit,
      }}
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
