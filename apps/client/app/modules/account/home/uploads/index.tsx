import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export function AccountUploadsModule() {
	const { currentUser } = useAuth()
	const { data, isError, isPending } = useGetCollectionContentsBySlug({
		slug: `${safeString(currentUser?.id)}_uploads`,
		query: {
			pagination: { page: 0, per: 50 },
			populate: ['content', 'content.tags'],
			filters: {
				visibility: 'ALL',
			},
		},
	})

	if (isPending) {
		return (
			<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3">
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
			<div className="my-20">
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
			<div className="my-20">
				<EmptyState
					message="There are no contents found yet. You could start uploading now."
					title="No content found"
				>
					<Button isLink href={PAGES.AUTHENTICATED_PAGES.UPLOAD}>
						<PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
						Upload new content
					</Button>
				</EmptyState>
			</div>
		)
	}

	return (
		<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3">
			{data.rows.map((collectionContent, index) => (
				<Fragment key={index}>
					{collectionContent.content ? (
						<div className="mb-7 break-inside-avoid md:mb-5">
							<Content
								content={collectionContent.content}
								showCreator={false}
							/>
							<div className="mt-1 hidden items-center gap-2 md:flex">
								{collectionContent.content.tags?.map((tag) => (
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
