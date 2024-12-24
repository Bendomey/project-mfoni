import { Link } from '@remix-run/react'
import { CollectionSection, CollectionShimmer } from './collection-section.tsx'
import { ContentSection, ContentShimmer } from './content-section.tsx'
import { CreatorSection, CreatorShimmer } from './creator-section.tsx'
import { TagSection, TagShimmer } from './tag-section.tsx'

interface Props<T> {
	type: 'TAG' | 'CONTENT' | 'COLLECTION' | 'CREATOR'
	title?: string
	seeMoreLink?: string
	contents: Array<T>
	isLoading?: boolean
	count?: number
}

const sections = {
	TAG: TagSection,
	CONTENT: ContentSection,
	COLLECTION: CollectionSection,
	CREATOR: CreatorSection,
}

const loadingSections = {
	TAG: TagShimmer,
	CONTENT: ContentShimmer,
	COLLECTION: CollectionShimmer,
	CREATOR: CreatorShimmer,
}

export function ExploreSection<
	T extends Tag | Content | Collection | EnhancedCreator,
>({
	type,
	title,
	seeMoreLink,
	contents,
	isLoading = false,
	count = 0,
}: Props<T>) {
	return (
		<div>
			<div className="flex flex-row items-center justify-between">
				<h2 className="flex items-center text-xl font-bold">
					{title}
					{count ? (
						<span className="ml-2 text-sm text-blue-600">{count}</span>
					) : undefined}
				</h2>
				{seeMoreLink ? (
					<Link
						prefetch="intent"
						to={seeMoreLink}
						className="text-sm text-blue-500"
					>
						See more
					</Link>
				) : null}
			</div>

			<div className="no-scrollbar mt-3 flex w-full items-center gap-8 overflow-x-auto">
				{isLoading
					? [...new Array(7)].map((_, index) => {
							const Section = loadingSections[type]
							return <Section key={index} />
						})
					: contents.map((content, index) => {
							const Section = sections[type]

							// fix type issue
							return <Section key={index} data={content as any} />
						})}
			</div>
		</div>
	)
}
