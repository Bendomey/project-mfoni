interface Props {
	data: EnhancedCreator
}

export function CreatorSection({}: Props) {
	return <>Tag</>
}

export function CreatorShimmer() {
	return (
		<div className="flex animate-pulse flex-col items-center gap-3">
			<div className="h-20 w-20 rounded-full bg-zinc-100" />
			<div className="h-3 w-36 rounded bg-zinc-100" />
			<div className="h-3 w-20 rounded bg-zinc-100" />
		</div>
	)
}
