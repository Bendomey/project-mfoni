import { Link } from '@remix-run/react'
import { Image } from 'remix-image'
import { useGetRelatedCreators } from '@/api/creators/index.ts'
import { Button } from '@/components/button/index.tsx'
import { useValidateImage } from '@/hooks/use-validate-image.tsx'
import { safeString } from '@/lib/strings.ts'

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
						<CreatorCard data={person} />
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

function CreatorCard({ data }: { data: BasicCreator }) {
	const isProfilePhotoValid = useValidateImage(safeString(data?.photo))

	return (
		<li className="rounded-md border bg-white p-4 hover:bg-zinc-100">
			<div className="flex items-center gap-2">
				{isProfilePhotoValid ? (
					<Image
						className="h-20 w-20 rounded-md"
						src={data.photo}
						alt={data.name}
					/>
				) : (
					<span className="h-20 w-20 rounded-md bg-zinc-100" />
				)}
				<div>
					<h3 className="text-base font-semibold leading-7 tracking-tight">
						{data.name}
					</h3>
					<span className="text-sm leading-6 text-gray-400">
						{data.username}
					</span>
				</div>
			</div>
		</li>
	)
}
