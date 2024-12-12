import { ArrowPathIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import dayjs from 'dayjs'
import { Fragment } from 'react'
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
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'
import { type loader } from '@/routes/collections.$collection.ts'

export function CollectionModule() {
	const { collection } = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const { currentUser } = useAuth()
	const { collection: collectionParam } = useParams()

	const isCollectionMine = collection?.createdBy?.id === currentUser?.id

	const { data, isPending, isError } = useGetCollectionContentsBySlug({
		slug: collectionParam,
		query: {
			pagination: { page: 0, per: 50 },
			filters: { visibility: isCollectionMine ? 'ALL' : 'PUBLIC' },
		},
	})

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
				<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8">
					{data.rows.map((collectionContent) => (
						<Fragment key={collectionContent.id}>
							{collectionContent.content ? (
								<Content content={collectionContent.content} />
							) : null}
						</Fragment>
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
					<div className="flex items-end gap-2">
						<h1 className="text-4xl font-black">{name}</h1>
						{isCollectionMine ? (
							<span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
								{collection?.visibility}
							</span>
						) : null}
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
					<span className="text-xs font-light text-gray-500">
						Published on {dayjs(collection?.createdAt).format('L')}
					</span>

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
							{isCollectionMine ? <Button>Add Contents</Button> : null}
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
		</>
	)
}
