/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {Header} from '@/components/layout/index.ts'
import {megabytesToBytes} from '@/lib/image-fns.ts'
import {useCallback, useMemo, useState} from 'react'
import {useDropzone, type FileRejection} from 'react-dropzone-esm'
import {toast} from 'react-hot-toast'
import {acceptFile, getErrorMessageForRejectedFiles} from './utils.ts'
import {ContentUploader} from './components/content-uploader.tsx'
import {ContentManager} from './components/contents-manager.tsx'

// 30 MB
const MAX_SIZE = 30
const MAX_FILES = 10

export interface Content {
  file: File
  status: 'accepted' | 'rejected'
  message: string
}

export const UploadModule = () => {
  const [contents, setContents] = useState<Content[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const newContents: Array<Content> = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        if (file) {
          const isDuplicate = contents.find(
            content => content.file.name === file.name,
          )
          if (isDuplicate) {
            continue
          }

          // eslint-disable-next-line no-await-in-loop
          const validationResponse = await acceptFile(file)
          newContents.push(validationResponse as Content)
        }
      }
      setContents(prevContents => [...newContents, ...prevContents])

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
    [contents],
  )

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: MAX_FILES - contents.length,
    maxSize: megabytesToBytes(MAX_SIZE),
  })

  const areContentsAdded = useMemo(() => Boolean(contents.length), [contents])

  return (
    <div {...getRootProps()} className="relative">
      <Header isHeroSearchInVisible={false} />
      <input {...getInputProps()} />

      {areContentsAdded ? (
        <ContentManager open={open} contents={contents} />
      ) : (
        <ContentUploader open={open} />
      )}

      {isDragActive ? (
        <div className="fixed h-screen w-screen overflow-hidden top-0 z-50 bg-black bg-opacity-70   backdrop-blur flex justify-center items-center">
          <h1 className="font-extrabold text-white text-6xl">
            Drop your images here.
          </h1>
        </div>
      ) : null}
    </div>
  )
}
