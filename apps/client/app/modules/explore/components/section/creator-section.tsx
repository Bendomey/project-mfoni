import { Link } from '@remix-run/react'
import { Image } from 'remix-image'
import { PAGES } from '@/constants/index.ts'
import { useValidateImage } from '@/hooks/use-validate-image.tsx'
import { getNameInitials } from '@/lib/misc.ts'
import { safeString } from '@/lib/strings.ts'

interface Props {
	data: EnhancedCreator
}

export function CreatorSection({ data }: Props) {
	const isProfilePhotoValid = useValidateImage(safeString(data.photo))
	const initials = getNameInitials(safeString(data.name))

	return (
		<Link to={PAGES.CREATOR.PHOTOS.replace(':username', data.username)}>
			<div className="flex max-w-64 flex-col items-center">
				{isProfilePhotoValid && data.photo ? (
					<Image
						className="inline-block h-24 w-24 rounded-full"
						src={data.photo}
						alt={data.name}
					/>
				) : (
					<span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
						<span className="text-3xl font-medium leading-none">
							{initials}
						</span>
					</span>
				)}
				<div className="my-2 flex flex-col items-center">
					<h1 className="max-w-60 truncate text-center font-bold">
						{data.name}
					</h1>
					<p className="max-w-60 truncate text-center text-xs font-medium">
						{data.username}
					</p>
				</div>
			</div>
		</Link>
	)
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
