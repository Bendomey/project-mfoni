import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useParams } from '@remix-run/react'
import { useSearchTextualContents } from '@/api/contents/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { NoSearchResultLottie } from '@/components/lotties/no-search-results.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'

export function SearchPhotosModule() {
	const { query: queryParam } = useParams()

	const searchQuery = safeString(queryParam)

	const { data, isPending, isError } = useSearchTextualContents({
		query: {
			pagination: { page: 0, per: 50 },
			filters: {},
			search: {
				query: queryParam,
			},
			populate: ['content.createdBy'],
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="mt-8 columns-1 gap-8 sm:columns-2 sm:gap-4 md:columns-3">
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-gray-100" />
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="flex h-[60vh] flex-1 items-center justify-center mx-5 md:mx-0">
				<ErrorState
					message="An error occurred searching contents."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.SEARCH.PHOTOS.replace(':query', searchQuery)}
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
			<div className="flex h-[60vh] flex-1 items-center justify-center mx-5 md:mx-0">
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

	if (data?.total) {
		content = (
			<div className="mt-8 min-h-[60vh] columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3">
				{data.rows.map((content) => (
					<div className="mb-7 md:mb-5" key={content.id}>
						<Content content={content} />
					</div>
				))}
			</div>
		)
	}

	return <>{content}</>
}
