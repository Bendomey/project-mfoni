import { Link } from '@remix-run/react'
import { useGetCollectionById } from '@/api/collections/index.ts'
import { CollectionCard } from '@/components/CollectionCard/index.tsx'

interface Props {
	collectionId: string
}

export function CollectionSection({ collectionId }: Props) {
	const { isPending, data, isError } = useGetCollectionById({
		id: collectionId,
		query: {
			populate: ['content'],
		},
	})

	if (isPending) return <CollectionShimmer />
	if (!data || isError) return null

	return (
		<div className="w-72">
			<CollectionCard collection={data} />
		</div>
	)
}

export function CollectionShimmer() {
	return (
		<Link to="" preventScrollReset className="animate-pulse space-y-2">
			<div className="h-44 w-72 rounded-md bg-zinc-100" />
			<div className="h-3 w-56 rounded bg-zinc-100" />
			<div className="h-2 w-40 rounded bg-zinc-100" />
		</Link>
	)
}
