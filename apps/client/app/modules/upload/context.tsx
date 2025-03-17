import { useActionData, useNavigation } from '@remix-run/react'
import {
	useContext,
	createContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone-esm'
import { v4 } from 'uuid'
import { BlockUploadDialog } from './components/block-upload-dialog.tsx'
import { ContentUploader } from './components/content-uploader.tsx'
import { ContentManager } from './components/contents-manager.tsx'
import { acceptFile, getErrorMessageForRejectedFiles } from './utils.ts'
import { useGetCollectionBySlug } from '@/api/collections/index.ts'
import { BlockNavigationDialog } from '@/components/block-navigation-dialog.tsx'
import { Header } from '@/components/layout/index.ts'
import { useBlocker } from '@/hooks/use-blocker.ts'
import { errorToast } from '@/lib/custom-toast-functions.tsx'
import {
	getImageOrientation,
	megabytesToBytes,
	palettize,
} from '@/lib/image-fns.ts'
import { getPackageUploadLimit } from '@/lib/pricing-lib.ts'
import { useAuth } from '@/providers/auth/index.tsx'

const MAX_SIZE = 10 // in megabytes
export const ACCEPTED_MAX_FILES = 10

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
	title: string
	visibility: IContentVisibility
	orientation: IContentOrientation
	backgroundColor?: string
	size: number
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
	updateContent: (contentId: string, data: Partial<Content>) => void
	deleteContent: (contentId: string) => void
	maxFiles: number
}

const ContentUploadContext = createContext<ContentUploadContext>({
	contents: {},
	setContents: () => {},
	openFileSelector: () => {},
	isSubmitting: false,
	updateContent: () => {},
	deleteContent: () => {},
	maxFiles: 10,
})

export const ContentUploadProvider = () => {
	const { currentUser, activeSubcription } = useAuth()
	const [contents, setContents] = useState<ContentUploadContext['contents']>({})

	const actionData = useActionData<{ error: string }>()
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'

	const {
		data: yourUploadCollection,
		isError: isErrorFetchingUploadCollection,
	} = useGetCollectionBySlug({
		slug: currentUser ? `${currentUser.id}_uploads` : undefined,
		query: {
			filters: {
				contentItemsLimit: 0,
			},
		},
		retryQuery: false,
	})

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (actionData?.error) {
			errorToast('Upload failed. Try again later.', {
				id: 'error-content-upload',
			})
		}
	}, [actionData])

	const onDrop = useCallback(
		async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
			const newContents: { [id: string]: Content } = {}

			for (let i = 0; i < acceptedFiles.length; i++) {
				const file = acceptedFiles[i]
				if (file) {
					const isDuplicate = Object.values(contents).find(
						(content) => content.file.name === file.name,
					)

					if (isDuplicate) {
						continue
					}

					const validationResponse = await acceptFile(file)
					const orientation = await getImageOrientation(file)
					const backgroundColor = await palettize(URL.createObjectURL(file))
					const contentId = v4()
					newContents[contentId] = {
						...(validationResponse as Content),
						visibility: 'PUBLIC',
						orientation,
						backgroundColor: backgroundColor[0]?.color,
						size: file.size,
						title: '',
						amount: '',
						tags: [],
					}
				}
			}
			setContents({ ...newContents, ...contents })

			if (fileRejections.length) {
				if (fileRejections[0]?.errors?.[0]?.code) {
					errorToast(
						getErrorMessageForRejectedFiles(
							fileRejections[0]?.errors?.[0]?.code,
						),
					)
				}
			}
		},
		[contents, setContents],
	)

	const yourUploadCount = useMemo(() => {
		if (!yourUploadCollection && isErrorFetchingUploadCollection) {
			return 0
		}

		if (yourUploadCollection) {
			return yourUploadCollection.contentsCount
		}

		return undefined
	}, [isErrorFetchingUploadCollection, yourUploadCollection])

	const isCreatorAllowedToUpload = useMemo(() => {
		if (
			currentUser?.role === 'CREATOR' &&
			yourUploadCount !== undefined &&
			activeSubcription
		) {
			return (
				getPackageUploadLimit(activeSubcription.packageType) > yourUploadCount
			)
		}

		return false
	}, [currentUser?.role, yourUploadCount, activeSubcription])

	const photosToUploadLeft = useMemo(() => {
		if (
			currentUser?.role === 'CREATOR' &&
			activeSubcription &&
			yourUploadCount !== undefined
		) {
			const whatsLeft =
				getPackageUploadLimit(activeSubcription.packageType) - yourUploadCount
			if (whatsLeft < 0) {
				return 0
			}

			// we always want users to upload only 10 images at a time
			return whatsLeft > ACCEPTED_MAX_FILES ? ACCEPTED_MAX_FILES : whatsLeft
		}

		return 0
	}, [currentUser?.role, activeSubcription, yourUploadCount])

	const maxFiles = useMemo(() => {
		return photosToUploadLeft - Object.keys(contents).length
	}, [contents, photosToUploadLeft])

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		open: openFileSelector,
	} = useDropzone({
		disabled: !isCreatorAllowedToUpload,
		onDrop,
		noClick: true,
		accept: {
			'image/png': ['.png', '.jpg', '.jpeg'],
		},
		maxFiles,
		maxSize: megabytesToBytes(MAX_SIZE),
	})

	const areContentsAdded = useMemo(
		() => Boolean(Object.values(contents).length),
		[contents],
	)

	const updateContent = (id: string, data: Partial<Content>) => {
		const newContents: { [id: string]: Content } = { ...contents }
		const content = newContents[id]
		if (content) {
			newContents[id] = { ...content, ...data }
		}
		setContents(newContents)
	}

	const deleteContent = useCallback(
		(contentId: string) =>
			setContents((prev) => {
				return Object.fromEntries(
					Object.entries(prev).filter(([key]) => key !== contentId),
				)
			}),
		[setContents],
	)

	// Block navigating elsewhere when data has been entered into the input
	const blocker = useBlocker(Boolean(Object.keys(contents).length))

	return (
		<ContentUploadContext.Provider
			value={{
				contents,
				setContents,
				updateContent,
				deleteContent,
				openFileSelector,
				isSubmitting,
				maxFiles,
			}}
		>
			<div {...getRootProps()} className="relative">
				<Header isHeroSearchInVisible={false} />
				<input {...getInputProps()} />

				{areContentsAdded ? <ContentManager /> : <ContentUploader />}
				{currentUser?.role === 'CLIENT' || yourUploadCount !== undefined ? (
					<BlockUploadDialog isOpened={!isCreatorAllowedToUpload} />
				) : null}

				<BlockNavigationDialog blocker={blocker} />

				{isDragActive ? (
					<div className="fixed top-0 z-50 flex h-screen w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70 backdrop-blur">
						<h1 className="text-2xl font-extrabold text-white md:text-4xl lg:text-6xl">
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

	if (!context) {
		throw new Error(
			'useContextUpload must be used within a ContentUploadProvider',
		)
	}

	return context
}
