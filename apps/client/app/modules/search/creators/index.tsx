import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useParams } from '@remix-run/react'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { useGetCreators } from '@/api/creators/index.ts'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
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
			<div className="flex h-[40vh] flex-1 items-center justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="flex h-[60vh] flex-1 items-center justify-center">
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
			<div className="flex h-[60vh] flex-1 items-center justify-center">
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

	return (
		<div className="mt-5">
			{featuredCreators?.total ? (
				<>
					<div className="flex flex-row items-center justify-between gap-x-2">
						<h2 className="flex items-center text-xl font-bold">Featured</h2>
					</div>
					<div className="no-scrollbar mt-3 flex w-full items-center gap-8 overflow-x-auto">
						{featuredCreators.rows.map((collectionContent) => (
							<CreatorSection
								key={collectionContent.id}
								data={collectionContent.creator as EnhancedCreator}
							/>
						))}
					</div>
				</>
			) : null}

			{content}
		</div>
	)
}
