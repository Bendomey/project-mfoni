import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useParams, useSearchParams } from '@remix-run/react'
import { FiltersDialog } from '../components/filters-dialog/index.tsx'
import { VisualHeader } from './components/header.tsx'
import { useSearchVisualContents } from '@/api/contents/index.ts'
import { FadeIn, FadeInStagger } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { Loader } from '@/components/loader/index.tsx'
import { NoSearchResultLottie } from '@/components/lotties/no-search-results.tsx'
import { PAGES } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { validateLicense, validateOrientation } from '@/lib/misc.ts'
import { safeString } from '@/lib/strings.ts'

export function SearchVisualModule() {
	const filterModalState = useDisclosure()
	const { query: queryParam } = useParams()
	const [searchParams] = useSearchParams()
	const searchQuery = safeString(queryParam)

	const { data, isPending, isError } = useSearchVisualContents({
		query: {
			pagination: { page: 0, per: 50 },
			filters: {
				mediaKey: safeString(queryParam),
				license: validateLicense(safeString(searchParams.get('license'))),
				orientation: validateOrientation(
					safeString(searchParams.get('orientation')),
				),
			},
			populate: ['content.createdBy'],
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="flex h-[60vh] flex-1 items-center justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="flex h-[60vh] flex-1 items-center justify-center">
				<ErrorState
					message="An error occurred searching contents."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.SEARCH.VISUAL.replace(':query', searchQuery)}
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

	if (data && !data?.results?.total) {
		content = (
			<div className="flex h-[60vh] flex-1 items-center justify-center">
				<EmptyState
					message="There are no photos found. Use a different image."
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

	if (data?.results?.total) {
		content = (
			<div className="mt-20">
				<hr className="my-5" />
				<FadeInStagger faster>
					<div className="min-h-[60vh] columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3">
						{data.results.rows.map((content) => (
							<div className="mb-5" key={content.id}>
								<FadeIn>
									<Content content={content} />
								</FadeIn>
							</div>
						))}
					</div>
				</FadeInStagger>
			</div>
		)
	}

	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-4 lg:px-8">
				<VisualHeader itemsCount={data?.results?.total ?? 0} />

				{isPending || !data ? null : (
					<div className="mt-10">
						<h1 className="text-3xl font-extrabold md:text-4xl">
							Visual Search
						</h1>
						<p className="mt-2 text-sm">
							Showing <b>{data?.results?.total}</b> visually similar results to
							your image.
						</p>
						{data?.imageUrl ? (
							<div className="mb-1 mt-8">
								<img
									src={data?.imageUrl}
									className="h-36 w-auto rounded-sm p-1 ring-2 ring-black"
									alt="captured_image"
								/>
							</div>
						) : null}
					</div>
				)}
				{content}
			</div>
			<Footer />
			<FiltersDialog
				isOpened={filterModalState.isOpened}
				onClose={filterModalState.onClose}
			/>
		</>
	)
}
