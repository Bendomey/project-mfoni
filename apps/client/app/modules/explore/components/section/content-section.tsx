import { Link } from '@remix-run/react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { Content } from '@/components/Content/index.tsx'

interface Props {
	data: Content
}

export function ContentSection({ data }: Props) {
	const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
	return (
		<Content
			content={data}
			imageHeight={isSmallDevice ? 200 : 300}
			className="w-[22rem] md:w-[28rem]"
		/>
	)
}

export function ContentShimmer() {
	return (
		<Link to="" preventScrollReset className="space-y-2">
			<div className="h-80 w-[28rem] animate-pulse rounded-md bg-zinc-100" />
		</Link>
	)
}
