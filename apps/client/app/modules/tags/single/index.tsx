import { ArrowPathIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import dayjs from 'dayjs'
import { useGetTagContentsBySlug } from '@/api/tags/index.ts'
import { FadeIn } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { Loader } from '@/components/loader/index.tsx'
import { ShareButton } from '@/components/share-button/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'
import { type loader } from '@/routes/tags.$tag.ts'

export function TagModule() {
	const navigate = useNavigate()
	const { tag } = useLoaderData<typeof loader>()
	const { tag: tagParam } = useParams()
	const { isPending, data, isError } = useGetTagContentsBySlug(
		safeString(tagParam),
		{
			pagination: { page: 0, per: 50 },
			filters: {},
			populate: ['content', 'content.createdBy'],
		},
	)

	const name = tag ? tag.name : tagParam

	let content = <></>

	if (isPending) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<ErrorState
					message="An error occurred fetching tag's contents."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.COLLECTION.replace(':tag', safeString(tagParam))}
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
					message={`There are no content found under "${name}". Come back later.`}
					title="No content found"
				/>
			</div>
		)
	}

	if (data?.total) {
		content = (
			<FadeIn>
				<div className="mt-8 columns-1 gap-2 sm:columns-2 sm:gap-3 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8">
					{data.rows.map((tagContent) => (
						<div className="mb-5" key={tagContent.id}>
							{tagContent.content ? (
								<Content
									key={tagContent.content.id}
									content={tagContent.content}
								/>
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
					<h1 className="text-4xl font-black">{name}</h1>
					<div className="mt-2 flex flex-col">
						<span className="font-medium text-gray-500">
							Curated by <span className="text-blue-600">mfoni</span>
						</span>
						<span className="text-xs font-light text-gray-500">
							Published on {dayjs(tag?.createdAt).format('L')}
						</span>
					</div>
					<div className="mt-5 flex flex-col justify-between gap-5 md:flex-row">
						<div>
							<p className="w-full text-sm font-medium md:w-2/3">
								Browse through the carefully curated contents around "{name}" —
								you could also submit your best work.
							</p>
						</div>
						<div className="flex flex-row items-center justify-end gap-2">
							{data?.total ? (
								<ShareButton
									text={`Browse through the carefully curated contents around "${name}"`}
								/>
							) : null}
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
