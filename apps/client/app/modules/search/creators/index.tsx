import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useParams } from '@remix-run/react'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { useGetCreators } from '@/api/creators/index.ts'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { NoSearchResultLottie } from '@/components/lotties/no-search-results.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'
import { CreatorSection } from '@/modules/explore/components/section/creator-section.tsx'

export function SearchCreatorsModule() {
	const { query: queryParam } = useParams()
	const searchQuery = safeString(queryParam)

	const { data, isPending, isError } = useGetCreators({
		pagination: { page: 0, per: 50 },
		filters: {},
		populate: [],
		search: {
			query: searchQuery,
		},
	})

	const { data: featuredCreators } = useGetCollectionContentsBySlug({
		slug: 'featured_creators',
		query: {
			pagination: { page: 0, per: 10 },
			filters: {},
			populate: ['creator'],
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="mt-8 grid min-h-[60vh] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...new Array(12)].map((_, index) => (
					<div
						key={index}
						className="flex animate-pulse flex-col items-center gap-3"
					>
						<div className="h-24 w-24 rounded-full bg-zinc-100" />
						<div className="h-3 w-36 rounded bg-zinc-100" />
						<div className="h-3 w-20 rounded bg-zinc-100" />
					</div>
				))}
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="mx-5 flex h-[60vh] flex-1 items-center justify-center md:mx-0">
				<ErrorState
					message="An error occurred searching creators."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.SEARCH.CREATORS.replace(':query', searchQuery)}
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
			<>
				{featuredCreators?.total && !data?.total ? (
					<div className="">
						<div className="flex flex-row items-center justify-between gap-x-2 px-4 md:px-5">
							<h2 className="flex items-center text-xl font-bold">Featured</h2>
						</div>
						<div className="no-scrollbar mt-3 flex w-full items-center gap-8 overflow-x-auto px-4 md:px-5">
							{featuredCreators.rows.map((collectionContent) => (
								<CreatorSection
									key={collectionContent.id}
									data={collectionContent.creator as EnhancedCreator}
								/>
							))}
						</div>
					</div>
				) : null}
				<div className="mx-5 flex h-[60vh] flex-1 items-center justify-center md:mx-0">
					<EmptyState
						message={`There are no creators found under "${queryParam}". Adjust your search query.`}
						title="Search results is empty"
						svg={
							<div className="mb-5">
								<NoSearchResultLottie />
							</div>
						}
					/>
				</div>
			</>
		)
	}

	if (data?.total) {
		content = (
			<FadeInStagger faster>
				<div className="mt-8 grid min-h-[60vh] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{data.rows.map((collection) => (
						<FadeIn key={collection.id}>
							<CreatorSection data={collection} />
						</FadeIn>
					))}
				</div>
			</FadeInStagger>
		)
	}

	return <div className="mt-5">{content}</div>
}
