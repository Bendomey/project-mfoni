import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
	ArrowPathIcon,
	ChevronLeftIcon,
	EllipsisHorizontalIcon,
	PencilIcon,
} from '@heroicons/react/24/outline'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { AddImageContentsModal } from './components/add-image-contents-modal.tsx'
import { EditCollectionTitleModal } from './components/edit-collection-modal/index.tsx'
import { RemoveImageContentModal } from './components/remove-image-content-dialog.tsx'
import { StatusButton } from './components/status-button.tsx'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { FadeIn } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { Loader } from '@/components/loader/index.tsx'
import { ShareButton } from '@/components/share-button/index.tsx'
import { UserImage } from '@/components/user-image.tsx'
import { PAGES } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'
import { type loader } from '@/routes/explore.collections.$collection.ts'

export function CollectionModule() {
	const { collection } = useLoaderData<typeof loader>()
	const addContentsModalState = useDisclosure()
	const navigate = useNavigate()
	const { currentUser } = useAuth()
	const { collection: collectionParam } = useParams()
	const removeContentsModalState = useDisclosure()
	const editCollectionModalState = useDisclosure()
	const [selectedCollectionContent, setSelectedCollectionContent] =
		useState<CollectionContent>()

	const isCollectionMine = collection?.createdBy?.id === currentUser?.id

	const { data, isPending, isError } = useGetCollectionContentsBySlug({
		slug: collectionParam,
		query: {
			pagination: { page: 0, per: 50 },
			filters: { visibility: isCollectionMine ? 'ALL' : 'PUBLIC' },
			populate: ['content'],
		},
	})

	if (!collection) return null

	const name = collection ? collection.name : collectionParam

	let content = <></>

	if (isPending) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<ErrorState
					message="An error occurred fetching collection's contents."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.COLLECTION.replace(
							':collection',
							safeString(collectionParam),
						)}
						linkProps={{
							reloadDocument: true,
						}}
					>
						<ArrowPathIcon
							aria-hidden="true"
							className="-ml-0.5 mr-1.5 size-5"
						/>
						Reload
					</Button>
				</ErrorState>
			</div>
		)
	}

	if (data && !data?.total) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<EmptyState
					message={
						isCollectionMine
							? `You have not added any content to this collection yet.`
							: `There are no content found under "${name}". Come back later.`
					}
					title="No content found"
				/>
			</div>
		)
	}

	if (data?.total) {
		content = (
			<FadeIn>
				<div className="mt-10 columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8">
					{data.rows.map((collectionContent) => (
						<div className="mb-5 break-inside-avoid" key={collectionContent.id}>
							{collectionContent.content ? (
								<>
									<Content content={collectionContent.content} />
									<div className="mt-2 flex justify-end">
										<Button
											onClick={() => {
												setSelectedCollectionContent(collectionContent)
												removeContentsModalState.onToggle()
											}}
											size="sm"
											color="dangerGhost"
										>
											Remove
										</Button>
									</div>
								</>
							) : null}
						</div>
					))}
				</div>
			</FadeIn>
		)
	}

	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
				<div className="mt-10">
					<Button
						onClick={() => navigate(-1)}
						variant="unstyled"
						className="mb-1 hover:underline"
					>
						<ChevronLeftIcon className="h-4 w-auto" />
						Go Back
					</Button>
					<div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
						<div className="flex flex-row">
							<h1 className="text-4xl font-black">{name}</h1>
						</div>
						<div className="flex items-center gap-3">
							{isCollectionMine ? (
								<>
									<span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
										{collection?.visibility}
									</span>

									<StatusButton
										collection={collection as unknown as Collection}
									/>

									<Menu as="div" className="relative">
										<div>
											<MenuButton>
												<Button
													variant="unstyled"
													className="px-2 hover:bg-zinc-100"
												>
													<EllipsisHorizontalIcon className="size-6 w-auto" />
												</Button>
											</MenuButton>
										</div>
										<MenuItems
											transition
											className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
										>
											<MenuItem>
												<Button
													onClick={editCollectionModalState.onToggle}
													variant="unstyled"
													className="flex w-full flex-col flex-wrap items-start rounded-none px-4 py-3 font-medium text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
												>
													<div className="flex items-center">
														<PencilIcon className="mr-2 size-4" />
														<p className="font-bold">Edit Title</p>
													</div>
												</Button>
											</MenuItem>
										</MenuItems>
									</Menu>
								</>
							) : null}
						</div>
					</div>
					{collection?.createdBy ? (
						<div className="mt-2 flex items-center gap-2">
							<UserImage
								name={collection?.createdBy?.name}
								image={collection?.createdBy?.photo}
								size="size-6"
							/>
							<span className="text-sm font-medium text-gray-500">
								Curated by{' '}
								{isCollectionMine ? 'you' : collection?.createdBy?.name}
							</span>
						</div>
					) : null}
					<div className="">
						<span className="text-xs font-light text-gray-500">
							Created on {dayjs(collection?.createdAt).format('L')}
						</span>
					</div>

					<div className="mt-5 flex flex-col justify-between gap-5 md:flex-row">
						<div className="md:w-2/3">
							<p className="w-full text-sm font-medium">
								{collection ? (
									collection.description
								) : (
									<>
										Browse through the carefully curated contents around "{name}
										" — you could also submit your best work.
									</>
								)}
							</p>
						</div>
						<div className="flex flex-row items-center justify-end gap-2">
							{isCollectionMine ? (
								<Button onClick={addContentsModalState.onToggle}>
									Add Contents
								</Button>
							) : null}
							<ShareButton
								text={`Check out this collection "${name}" on mfoni`}
							/>
							<Button color="dangerGhost">Report</Button>
						</div>
					</div>
				</div>

				{content}
			</div>
			<Footer />
			<AddImageContentsModal
				existingContents={data?.rows ?? []}
				collection={collection as unknown as Collection}
				isOpened={addContentsModalState.isOpened}
				onClose={addContentsModalState.onToggle}
			/>
			<RemoveImageContentModal
				isOpened={removeContentsModalState.isOpened}
				onClose={removeContentsModalState.onClose}
				collectionContent={selectedCollectionContent}
				collectionSlug={collection?.slug}
				collectionVisibility={collection?.visibility}
				count={data?.rows.length ?? 0}
			/>
			<EditCollectionTitleModal
				isOpened={editCollectionModalState.isOpened}
				closeModal={editCollectionModalState.onClose}
				title={collection.name}
				collectionId={collection?.id}
			/>
		</>
	)
}
