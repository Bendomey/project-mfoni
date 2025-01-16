import { Link } from '@remix-run/react'
import { Image } from 'remix-image'
import { useGetRelatedCreators } from '@/api/creators/index.ts'
import { Button } from '@/components/button/index.tsx'

interface Props {
	username: string
}

export function OtherCreators({ username }: Props) {
	const { data, isPending, isError, refetch } = useGetRelatedCreators(
		username,
		{
			pagination: {
				page: 0,
				per: 5,
			},
		},
	)

	let content = <></>

	if (isPending) {
		content = (
			<>
				<ul className="grid grid-cols-1 gap-2">
					<OtherCreatorShimmer />
					<OtherCreatorShimmer />
					<OtherCreatorShimmer />
					<OtherCreatorShimmer />
				</ul>
			</>
		)
	}

	if (isError) {
		content = (
			<div>
				<p className="text-sm leading-6 text-gray-400">
					Error occured while fetching creators.
				</p>
				<Button
					onClick={() => refetch()}
					size="sm"
					color="infoGhost"
					className="mt-2"
				>
					Retry
				</Button>
			</div>
		)
	}

	if (data?.rows.length === 0) {
		content = (
			<p className="text-sm leading-6 text-gray-400">No creators found.</p>
		)
	}

	if (data?.rows.length) {
		content = (
			<ul className="grid grid-cols-1 gap-2">
				{data?.rows.map((person) => (
					<Link prefetch="intent" to={`/@${person.username}`} key={person.id}>
						<li className="rounded-md border bg-white p-4 hover:bg-zinc-100">
							<div className="flex items-center gap-2">
								<Image
									alt={person.name}
									src={person.photo}
									className="h-20 w-20 rounded-md"
								/>
								<div>
									<h3 className="text-base font-semibold leading-7 tracking-tight">
										{person.name}
									</h3>
									<span className="text-sm leading-6 text-gray-400">
										{person.username}
									</span>
								</div>
							</div>
						</li>
					</Link>
				))}
			</ul>
		)
	}

	return (
		<div>
			<h3 className="text-base font-semibold leading-6 text-gray-900">
				Creators you may like.
			</h3>
			<div className="mt-3">{content}</div>
		</div>
	)
}

function OtherCreatorShimmer() {
	return (
		<div className="animate-pulse rounded-md border bg-white p-4">
			<div className="flex items-center gap-2">
				<div className="h-20 w-20 rounded-md bg-zinc-100" />
				<div>
					<div className="h-4 w-32 bg-zinc-200" />
					<div className="mt-3 h-3 w-20 bg-zinc-100" />
				</div>
			</div>
		</div>
	)
}
