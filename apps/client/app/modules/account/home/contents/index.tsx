import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useGetContentPurchases } from '@/api/purchases/index.ts'
import { Button } from '@/components/button/index.tsx'
import { Content } from '@/components/Content/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export function AccountContentsModule() {
	const { currentUser } = useAuth()
	const { data, isError, isPending } = useGetContentPurchases({
		filters: {
			userId: safeString(currentUser?.id),
		},
		pagination: { page: 0, per: 50 },
		populate: ['contentPurchase.content', 'content.createdBy'],
	})

	if (isPending) {
		return (
			<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3">
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
				<div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
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
					message="You could start by exploring some contents."
					title="You have no contents purchased"
				>
					<Button isLink href={PAGES.EXPLORE}>
						Explore
					</Button>
				</EmptyState>
			</div>
		)
	}

	return (
		<div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8">
			{data?.rows.map((contentPurchase, index) => (
				<Fragment key={index}>
					<div className="mb-5 break-inside-avoid">
						{contentPurchase.content ? (
							<Content content={contentPurchase.content} />
						) : null}
					</div>
				</Fragment>
			))}
		</div>
	)
}
