import { useParams } from '@remix-run/react'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { NoSearchResultLottie } from '@/components/lotties/no-search-results.tsx'
import { CreatorSection } from '@/modules/explore/components/section/creator-section.tsx'

export function SearchCreatorsModule() {
	const { query: queryParam } = useParams()

	const { data: featuredCreators } = useGetCollectionContentsBySlug({
		slug: 'featured_creators',
		query: {
			pagination: { page: 0, per: 10 },
			filters: {},
			populate: ['creator'],
		},
	})

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

			<div className="flex h-[40vh] flex-1 items-center justify-center">
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
		</div>
	)
}
