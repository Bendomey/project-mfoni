import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useCreator } from '../index.tsx'
import { useGetCollections } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { CollectionCard } from '@/components/CollectionCard/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'

export function CreatorCollectionsModule() {
	const creator = useCreator()

	const { data, isError, isPending, refetch } = useGetCollections({
		pagination: { page: 0, per: 50 },
		filters: {
			created_by: creator?.userId,
			visibility: 'PUBLIC',
			contentItemsLimit: 4,
		},
		populate: ['content'],
	})

	if (isPending) {
		return (
			<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[...new Array(12)].map((_, index) => (
					<div key={index} className="animate-pulse space-y-2">
						<div className="h-60 w-full rounded-sm bg-zinc-200" />
						<div className="h-3 w-2/3 rounded-sm bg-zinc-200" />
						<div className="h-2 w-1/2 rounded-sm bg-zinc-200" />
					</div>
				))}
			</div>
		)
	}

	if (isError) {
		return (
			<div className="my-16">
				<ErrorState
					message="An error occurred fetching collections."
					title="Something happened."
				>
					<Button onClick={() => refetch()} variant="outlined">
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

	if (!data?.total) {
		return (
			<div className="my-16">
				<EmptyState
					message={`${creator?.name} has not created any collections yet.`}
					title="No collections found"
				/>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
			{data.rows.map((collection) => (
				<CollectionCard key={collection.id} collection={collection} className='md:h-[15rem]' />
			))}
		</div>
	)
}
