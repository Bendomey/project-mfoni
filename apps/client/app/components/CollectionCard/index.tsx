import { Link } from '@remix-run/react'
import { ContentItemImages } from './content-item.tsx'
import { PAGES } from '@/constants/index.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	collection: Collection
}

export function CollectionCard({ collection }: Props) {
	const { currentUser } = useAuth()
	const isCollectionMine = currentUser?.id === collection.createdBy?.id
	return (
		<Link to={PAGES.COLLECTION.replace(':collection', collection.slug)}>
			<div className="h-52 overflow-hidden rounded-md hover:opacity-75">
				<ContentItemImages
					collectionName={collection.name}
					contents={collection.contentItems ?? []}
				/>
			</div>
			<div className="mt-1">
				<h1 className="truncate text-lg font-bold">{collection.name}</h1>
				<p className="truncate text-xs text-gray-500">
					{collection.contentsCount} contents{' '}
					{collection.createdBy?.name
						? `· Curated by ${
								isCollectionMine ? 'you' : collection.createdBy?.name
							}`
						: ''}
				</p>
			</div>
		</Link>
	)
}
