import { Link } from '@remix-run/react'

interface Props {
	data: Content
}

export function ContentSection({}: Props) {
	return <>Content</>
}

export function ContentShimmer() {
	return (
		<Link to="" preventScrollReset className="space-y-2">
			<div className="h-36 w-60 animate-pulse rounded-md bg-zinc-100" />
		</Link>
	)
}
