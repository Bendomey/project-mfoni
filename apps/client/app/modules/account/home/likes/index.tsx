import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useGetUserContentLikes } from '@/api/contents/index.ts'
import { FadeIn } from '@/components/animation/FadeIn.tsx'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Loader } from '@/components/loader/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export function AccountLikesModule() {
	const { currentUser } = useAuth()
	const { data, isPending, isError } = useGetUserContentLikes(
		{
			pagination: { page: 0, per: 50 },
			populate: ['content'],
		},
		safeString(currentUser?.id),
	)

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
				message="An error occurred fetching your likes."
				title="Something happened."
			>
				<Button
					isLink
					variant="outlined"
					href={PAGES.AUTHENTICATED_PAGES.ACCOUNT_LIKES}
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
				message="There are no likes found yet. Start liking content you love and they'll be added here."
				title="No likes found"
			/>
		)
	}

	return (
		<FadeIn>
			<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
				{data.rows.map((contentLike, index) => (
					<Fragment key={index}>
						{contentLike.content ? (
							<Content content={contentLike.content} showCreator={false} />
						) : null}
					</Fragment>
				))}
			</div>
		</FadeIn>
	)
}
