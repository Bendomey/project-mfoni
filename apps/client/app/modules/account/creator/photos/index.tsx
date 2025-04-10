import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useCreator } from '../index.tsx'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'

import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'

export function CreatorPhotosModule() {
	const creator = useCreator()
	const { data, isError, isPending, refetch } = useGetCollectionContentsBySlug({
		slug: `${safeString(creator?.userId)}_uploads`,
		query: {
			pagination: { page: 0, per: 50 },
			populate: ['content', 'content.tags'],
			filters: {
				visibility: 'PUBLIC',
			},
		},
	})

	if (isPending) {
		return (
			<div className="mt-8 columns-1 gap-8 sm:columns-2 sm:gap-4 md:columns-3">
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-sm bg-zinc-200" />
			</div>
		)
	}

	if (isError) {
		return (
			<ErrorState
				message="An error occurred fetching creator's photos."
				title="Something happened."
			>
				<Button onClick={() => refetch()} variant="outlined">
					<ArrowPathIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
					Reload
				</Button>
			</ErrorState>
		)
	}

	if (!data?.total) {
		return (
			<EmptyState
				message="There are no photos found yet Come back later."
				title="No content found"
			/>
		)
	}

	return (
		<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
			{data.rows.map((collectionContent, index) => (
				<Fragment key={index}>
					{collectionContent.content ? (
						<div className="mb-5 break-inside-avoid">
							<Content
								content={collectionContent.content}
								showCreator={false}
							/>
							<div className="mt-1 hidden items-center gap-2 md:flex">
								{collectionContent.content.tags?.slice(0, 3)?.map((tag) => (
									<Button
										key={tag.id}
										size="sm"
										isLink
										href={PAGES.TAG.replace(':tag', tag.slug)}
										variant="outlined"
										className="rounded"
									>
										{tag.name}
									</Button>
								))}
							</div>
						</div>
					) : null}
				</Fragment>
			))}
		</div>
	)
}
