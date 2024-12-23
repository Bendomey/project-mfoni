import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useCreator } from '../index.tsx'
import { useGetUserContentLikes } from '@/api/users/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { safeString } from '@/lib/strings.ts'

export function CreatorLikesModule() {
	const creator = useCreator()
	const { data, isPending, isError, refetch, isRefetching } =
		useGetUserContentLikes(
			{
				pagination: { page: 0, per: 50 },
				populate: ['content'],
				filters: {
					visibility: 'PUBLIC',
				},
			},
			safeString(creator?.userId),
		)

	if (isPending || isRefetching) {
		return (
			<div className="my-16 flex justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		return (
			<ErrorState
				message="An error occurred fetching your likes."
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
				message="They've not liked any content yet."
				title="No likes found"
			/>
		)
	}

	return (
		<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
			{data.rows.map((contentLike, index) => (
				<div className="mb-5" key={index}>
					{contentLike.content ? (
						<Content content={contentLike.content} showCreator={false} />
					) : null}
				</div>
			))}
		</div>
	)
}
