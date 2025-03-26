import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useGetCollectionContentsBySlug } from '@/api/collections/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'
import { imageUrls } from '@/modules/landing-page/index.tsx'
import { useAuth } from '@/providers/auth/index.tsx'

export function AccountContentsModule() {
	// const { currentUser } = useAuth()
	// const { data, isError, isPending } = useGetCollectionContentsBySlug({
	// 	slug: `${safeString(currentUser?.id)}_uploads`,
	// 	query: {
	// 		pagination: { page: 0, per: 50 },
	// 		populate: ['content', 'content.tags'],
	// 	},
	// })

	// if (isPending) {
	// 	return (
	// 		<div className="my-16 flex justify-center">
	// 			<Loader />
	// 		</div>
	// 	)
	// }

	// if (isError) {
	// 	return (
	// 		<ErrorState
	// 			message="An error occurred fetching your contents."
	// 			title="Something happened."
	// 		>
	// 			<Button
	// 				isLink
	// 				variant="outlined"
	// 				href={PAGES.AUTHENTICATED_PAGES.ACCOUNT}
	// 				linkProps={{
	// 					reloadDocument: true,
	// 				}}
	// 			>
	// 				<ArrowPathIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
	// 				Reload
	// 			</Button>
	// 		</ErrorState>
	// 	)
	// }

	// if (!data?.total) {
	// 	return (
	// 		<EmptyState
	// 			message="There are no contents found yet. You could start uploading now."
	// 			title="No content found"
	// 		>
	// 			<Button isLink href={PAGES.AUTHENTICATED_PAGES.UPLOAD}>
	// 				<PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
	// 				Upload new content
	// 			</Button>
	// 		</EmptyState>
	// 	)
	// }

	return (
		<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
			{imageUrls.map((url, index) => (
				<Fragment key={index}>
					<div className="mb-5 break-inside-avoid">
						<Content content={{ media: { url } } as any} showCreator={false} />
						<div className="mt-1 flex items-center gap-2">
							{['tag1', 'tag2']?.map((tag) => (
								<Button
									key={tag}
									size="sm"
									isLink
									href={PAGES.TAG.replace(':tag', tag)}
									variant="outlined"
									className="rounded"
								>
									{tag}
								</Button>
							))}
						</div>
					</div>
				</Fragment>
			))}
		</div>
	)
}
