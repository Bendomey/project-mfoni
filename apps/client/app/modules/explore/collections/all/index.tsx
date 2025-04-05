import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useGetCollections } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { CollectionCard } from '@/components/CollectionCard/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { PAGES } from '@/constants/index.ts'

export function CollectionsModule() {
	const { data, isPending, isError } = useGetCollections({
		pagination: { page: 0, per: 50 },
		filters: { visibility: 'PUBLIC' },
		populate: ['collection.createdBy', 'content'],
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[...new Array(12)].map((_, index) => (
					<div key={index} className="animate-pulse space-y-2">
						<div className="h-60 w-full rounded-sm bg-zinc-100" />
						<div className="h-3 w-2/3 rounded-sm bg-zinc-100" />
						<div className="h-2 w-1/2 rounded-sm bg-zinc-100" />
					</div>
				))}
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<ErrorState
					message="An error occurred fetching your contents."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.COLLECTIONS}
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
					message="There are no collections found yet. Come back later."
					title="No collections found"
				/>
			</div>
		)
	}

	if (data?.total) {
		content = (
			<div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
				{data.rows.map((collection) => (
					<Fragment key={collection.id}>
						<CollectionCard collection={collection} className='h-[25rem] md:h-[18rem]' />
					</Fragment>
				))}
			</div>
		)
	}

	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-0 py-4 lg:px-8">
				<div className="mt-5 px-4 md:px-0">
					<h1 className="text-4xl font-black">Collections</h1>
					<div className="mt-5">
						<p className="w-full text-sm font-medium md:w-1/3">
							Explore the world through collections of beautiful images to use
							under the mfoni License.
						</p>
					</div>
				</div>

				{content}
			</div>
			<Footer />
		</>
	)
}
