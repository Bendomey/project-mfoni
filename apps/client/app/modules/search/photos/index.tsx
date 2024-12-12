import { useParams } from '@remix-run/react'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { NoSearchResultLottie } from '@/components/lotties/no-search-results.tsx'

export function SearchPhotosModule() {
	const { query: queryParam } = useParams()
	return (
		<div className="flex h-[60vh] flex-1 items-center justify-center">
			<EmptyState
				message={`There are no photos found under "${queryParam}". Adjust your search query.`}
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
