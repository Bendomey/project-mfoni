import { Link } from '@remix-run/react'

interface Props {
	data: Collection
}

export function CollectionSection({}: Props) {
	return <>Tag</>
}

export function CollectionShimmer() {
	return (
		<Link to="" preventScrollReset className="animate-pulse space-y-2">
			<div className="h-36 w-44 rounded-md bg-zinc-100" />
			<div className="h-3 w-36 rounded bg-zinc-100" />
		</Link>
	)
}
