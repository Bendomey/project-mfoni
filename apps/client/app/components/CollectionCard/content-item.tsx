import { ContentItemImage } from './content-item-image.tsx'
import { classNames } from '@/lib/classNames.ts'

interface ContentItemImagesProps {
	collectionName: string
	contents: Array<CollectionContent>
}

const gridClasses = [
	'grid-cols-1 grid-rows-1',
	'grid-cols-1 grid-rows-2',
	'grid-cols-2 grid-rows-2',
]
export function ContentItemImages({
	contents,
	collectionName,
}: ContentItemImagesProps) {
	if (contents.length > 4) {
		contents = contents.slice(0, 4)
	}

	return contents.length > 1 ? (
		<div
			className={classNames(
				`rounded-0.5 grid h-full w-full gap-1 overflow-hidden ${
					gridClasses[contents.length - 1] ??
					gridClasses[gridClasses.length - 1]
				}`,
			)}
		>
			{contents.map((collectionContent, index) => (
				<ContentItemImage
					content={collectionContent.content}
					contentAlt={`${collectionName}-${index + 1}`}
					contentsLength={contents.length}
					key={`${collectionName}-${index + 1}`}
					styles={`object-cover w-full h-full ${
						contents.length === 3 && index === 2 ? 'col-span-2' : ''
					}`}
				/>
			))}
		</div>
	) : (
		<ContentItemImage
			content={contents[0]?.content}
			contentAlt={collectionName}
			contentsLength={contents.length}
			styles="rounded-0.5 overflow-hidden h-full w-full"
		/>
	)
}
