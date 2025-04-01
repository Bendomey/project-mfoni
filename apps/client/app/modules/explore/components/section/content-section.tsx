import { Link } from '@remix-run/react'
import { Content } from '@/components/Content/index.tsx'
import { classNames } from '@/lib/classNames.ts'

interface Props {
	data: Content
}

export function ContentSection({ data }: Props) {
	return (
		<Content
			content={data}
			className={classNames({
				'h-80 w-[28rem]': data.media.orientation === 'LANDSCAPE',
				'h-80 w-80': data.media.orientation === 'SQUARE',
				'h-80 w-[19rem]': data.media.orientation === 'PORTRAIT',
			})}
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
