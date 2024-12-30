import { ArrowPathIcon, TagIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'
import dayjs from 'dayjs'
import { useGetTags } from '@/api/tags/index.ts'
import { Button } from '@/components/button/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import { ErrorState } from '@/components/error-state/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { Loader } from '@/components/loader/index.tsx'
import { PAGES } from '@/constants/index.ts'

export function TagsModule() {
	const { data, isPending, isError } = useGetTags({
		pagination: { page: 0, per: 50 },
		filters: {
			visibility: 'PUBLIC',
		},
	})

	let content = <></>

	if (isPending) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<Loader />
			</div>
		)
	}

	if (isError) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<ErrorState
					message="An error occurred fetching your tags."
					title="Something happened."
				>
					<Button
						isLink
						variant="outlined"
						href={PAGES.TAGS}
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

	if (data && !data?.total) {
		content = (
			<div className="flex h-[50vh] flex-1 items-center justify-center">
				<EmptyState
					message="There are no tags found yet. Come back later."
					title="No tags found"
				/>
			</div>
		)
	}

	if (data?.total) {
		content = (
			<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{data.rows.map((tag) => (
					<Link to={PAGES.TAG.replace(':tag', tag.slug)} key={tag.id}>
						<div className="rounded border bg-zinc-50 px-4 py-2 hover:bg-zinc-100">
							<div className="flex items-center gap-2">
								<TagIcon className="size-5 text-black" />
								<div>
									<h1 className="line-clamp-2 capitalize">{tag.name}</h1>
									<p className="text-xs text-zinc-400">
										created on {dayjs(tag.createdAt).format('L')}
									</p>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		)
	}

	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
				<div className="mt-10">
					<h1 className="text-4xl font-black">Tags</h1>
					<div className="mt-8">
						<p className="w-full text-sm font-medium md:w-1/3">
							Explore the world through tags of beautiful images to use under
							the mfoni License.
						</p>
					</div>
				</div>

				{content}
			</div>
			<Footer />
		</>
	)
}
