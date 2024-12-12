import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useGetCollections } from '@/api/collections/index.ts'
import { FadeIn } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { CollectionCard } from '@/components/CollectionCard/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export function AccountCollectionsModule() {
	const { currentUser } = useAuth()
	const { data, isError, isPending } = useGetCollections({
		pagination: { page: 0, per: 50 },
		filters: {
			created_by: currentUser?.id,
			visibility: 'ALL',
		},
	})

	if (isPending) {
		return (
			<div className="my-16 flex justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		return (
			<ErrorState
				message="An error occurred fetching your contents."
				title="Something happened."
			>
				<Button
					isLink
					variant="outlined"
					href={PAGES.AUTHENTICATED_PAGES.ACCOUNT}
					linkProps={{
						reloadDocument: true,
					}}
				>
					<ArrowPathIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
					Reload
				</Button>
			</ErrorState>
		)
	}

	if (!data?.total) {
		return (
			<EmptyState
				message="There are no collections found yet. You could create one now."
				title="No collections found"
			>
				<Button isLink href={PAGES.AUTHENTICATED_PAGES.UPLOAD}>
					<PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
					Create Collection
				</Button>
			</EmptyState>
		)
	}

	return (
		<FadeIn>
			<div className="grid grid-cols-2 gap-8 md:grid-cols-3">
				{data.rows.map((collection, index) => (
					<CollectionCard key={index} collection={collection} />
				))}
			</div>
		</FadeIn>
	)
}
