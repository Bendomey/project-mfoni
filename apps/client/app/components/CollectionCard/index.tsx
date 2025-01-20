import { Link } from '@remix-run/react'
import { ContentItemImages } from './content-item.tsx'
import { PAGES } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	collection: Collection
	className?: string
}

export function CollectionCard({ collection, className }: Props) {
	const { currentUser } = useAuth()
	const isCollectionMine = currentUser?.id === collection.createdBy?.id
	return (
		<Link to={PAGES.COLLECTION.replace(':collection', collection.slug)}>
			<div
				className={classNames(
					'relative h-52 overflow-hidden rounded-md',
					className,
				)}
			>
				<ContentItemImages
					collectionName={collection.name}
					contents={collection.contentItems ?? []}
				/>

				<div className="absolute right-0 top-0 h-full w-full p-2 hover:bg-black/5">
					<div className="flex">
						{collection.visibility === 'PRIVATE' ? (
							<div className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
								Hidden
							</div>
						) : null}
					</div>
				</div>
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
