import { Link } from '@remix-run/react'
import { Content } from '@/components/Content/index.tsx'

interface Props {
	data: Content
}

export function ContentSection({ data }: Props) {
	return (
		<div className="h-auto w-80">
			<Content content={data} />
		</div>
	)
}

export function ContentShimmer() {
	return (
		<Link to="" preventScrollReset className="space-y-2">
			<div className="h-36 w-60 animate-pulse rounded-md bg-zinc-100" />
		</Link>
	)
}
