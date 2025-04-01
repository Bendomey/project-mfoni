import { TrashIcon } from '@heroicons/react/24/solid'
import { useEffect, useMemo } from 'react'
import { useContentUpload } from '../../context.tsx'
import { TagsPicker } from './tags-picker.tsx'
import { VisibilityPicker } from './visibility-picker.tsx'
import { Button } from '@/components/button/index.tsx'
import { Image } from '@/components/Image.tsx'
import { Loader } from '@/components/loader/index.tsx'
import useImageUpload from '@/hooks/use-image-upload.ts'

export const ContentEditor = ({ contentId }: { contentId: string }) => {
	const { contents, updateContent, deleteContent } = useContentUpload()
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
				updateContent(contentId, { uploadStatus: 'uploading' })
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
		<div className="mx-5 flex flex-row items-center gap-4 md:mx-0">
			<div className="w-full">
				<div className="flex justify-center md:hidden">
					<Image
						src={imageUrl}
						alt={content?.file.name ?? 'uploaded-image'}
						className="rounded-2xl"
					/>
				</div>
				<div className="mb-5 flex justify-center md:hidden">
					<Button
						onClick={handleDelete}
						color={isRejected ? 'danger' : 'secondaryGhost'}
						className={`mt-5 font-bold`}
						size="xl"
					>
						Delete this Photo
					</Button>
				</div>
				<div
					className={`${
						isRejected ? 'bg-red-50' : 'bg-zinc-100'
					} mb-20 rounded-3xl px-10 py-10 md:mb-0 md:px-16`}
				>
					<div className="grid grid-cols-2 items-center gap-10">
						<div className="relative col-span-1 hidden w-full md:block">
							<Image
								src={imageUrl}
								alt={content?.file.name ?? 'uploaded-image'}
								className="rounded-2xl"
							/>
							{isLoading ? (
								<div className="absolute right-0 top-0 flex h-full w-full animate-pulse items-center justify-center rounded-2xl bg-black bg-opacity-70">
									<Loader color="fill-white" size="20" />
								</div>
							) : null}
						</div>
						<div className="col-span-2 md:col-span-1">
							{isRejected ? (
								<>
									<h1 className="text-3xl font-bold text-red-600">Error</h1>
									<p className="mt-2 font-medium text-red-600">
										{content?.message}
									</p>
									<Button
										onClick={handleDelete}
										className="mt-5 hidden bg-red-600 hover:bg-red-700 md:block"
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
											className="block text-lg font-semibold leading-6 text-gray-500"
										>
											Title <span className="text-gray-300">(Required)</span>
										</label>
										<div className="mt-2">
											<input
												type="text"
												name="title"
												id="title"
												value={content?.title}
												onChange={(e) =>
													updateContent(contentId, { title: e.target.value })
												}
												autoComplete="off"
												className="block w-full rounded-md border-0 py-3 text-lg font-bold text-gray-900 ring-0 ring-inset ring-gray-300 placeholder:font-medium placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
												placeholder="Enter title"
											/>
										</div>
									</div>
									<div>
										<label
											htmlFor="tags"
											className="block text-lg font-semibold leading-6 text-gray-500"
										>
											Tags <span className="text-gray-300">(optional)</span>
										</label>
										<div className="mt-2">
											<TagsPicker
												tags={content?.tags ?? []}
												setTags={(tags) => updateContent(contentId, { tags })}
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor="email"
											className="block text-lg font-semibold leading-6 text-gray-500"
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
												onChange={(e) =>
													updateContent(contentId, { amount: e.target.value })
												}
												className="block w-full rounded-md border-0 py-3 text-lg font-bold text-gray-900 ring-0 ring-inset ring-gray-300 placeholder:font-medium placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
												placeholder="Free"
											/>
										</div>
									</div>

									<div>
										<VisibilityPicker
											visibility={content?.visibility}
											setVisibility={(visibility) =>
												updateContent(contentId, { visibility })
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
					className="rounded-full bg-zinc-100 p-5"
				>
					<TrashIcon className="h-10 w-auto text-zinc-300 hover:text-zinc-600" />
				</Button>
			</div>
		</div>
	)
}
