import { ClockIcon } from '@heroicons/react/20/solid'
import {
	LockClosedIcon,
	HeartIcon as HeartIconOutline,
	ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import {
	HeartIcon as HeartIconSolid,
	XCircleIcon,
} from '@heroicons/react/24/solid'
import { Link } from '@remix-run/react'
import { Image } from 'remix-image'
import { Button } from '../button/index.tsx'
import { PhotographerCreatorCard } from '../creator-card/index.tsx'
import { FlyoutContainer } from '../flyout/flyout-container.tsx'
import { LikeButton } from '@/components/like-button.tsx'
import { blurDataURL, PAGES } from '@/constants/index.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	content: Content
	showCreator?: boolean
	showTags?: boolean
}

export const Content = ({ content, showCreator = true }: Props) => {
	const { currentUser } = useAuth()

	const isContentMine = content.createdById === currentUser?.id
	return (
		<Link
			to={PAGES.PHOTO.replace(':slug', content.slug)}
			state={{ modal: true }}
		>
			<div className="relative cursor-zoom-in">
				<Image
					src={content.media.url}
					className="h-auto max-w-full rounded-lg"
					blurDataURL={blurDataURL}
					alt={content.title}
				/>
				<div className="group absolute top-0 h-full w-full rounded-lg hover:bg-black/50">
					<div className="flex h-full w-full flex-col justify-between p-2">
						<div className="flex flex-row items-center justify-between p-2">
							<div className="flex items-center gap-1">
								{content.amount > 0 ? (
									<div className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
										mfoni+
									</div>
								) : null}
								{content.status === 'REJECTED' ? (
									<div className="gap-.5 flex items-center rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
										<XCircleIcon className="size-5" />
										Rejected
									</div>
								) : content.status === 'PROCESSING' ? (
									<div className="rounded-full bg-blue-600 px-1 py-1 text-sm font-semibold text-white">
										<ClockIcon className="size-5" />
									</div>
								) : content.visibility === 'PRIVATE' ? (
									<div className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
										Hidden
									</div>
								) : null}
							</div>
							<div className="hidden group-hover:block">
								{content.status !== 'DONE' ? null : (
									<LikeButton content={content}>
										{({ isDisabled, isLiked, onClick }) => (
											<Button
												title={isLiked ? 'Remove Like' : 'Like Image'}
												onClick={(e) => {
													e.preventDefault()
													onClick()
												}}
												variant="outlined"
												size="sm"
												className="px-2"
												disabled={isDisabled}
											>
												{isLiked ? (
													<HeartIconSolid className="h-6 w-6 text-blue-700" />
												) : (
													<HeartIconOutline className="h-6 w-6 text-zinc-700" />
												)}
											</Button>
										)}
									</LikeButton>
								)}
							</div>
						</div>
						<div className="hidden flex-row items-center justify-between gap-2.5 group-hover:flex">
							{showCreator && content.createdBy ? (
								<FlyoutContainer
									intendedPosition="y"
									FlyoutContent={
										<PhotographerCreatorCard
											name={content.createdBy.name}
											socialMedia={content.createdBy.socialMedia}
										/>
									}
								>
									<div className="flex items-center">
										<Image
											className="inline-block h-7 w-7 rounded-full"
											src={content.createdBy.photo}
											alt={content.createdBy.name}
										/>
										<span className="ml-2 text-sm font-medium text-white">
											{content.createdBy.name}
										</span>
									</div>
								</FlyoutContainer>
							) : (
								<div />
							)}

							<div>
								{content.amount === 0 || isContentMine ? (
									<Button
										variant="outlined"
										onClick={(e) => {
											e.preventDefault()
										}}
									>
										<ArrowDownTrayIcon className="mr-2 h-4 w-4" />
										Download
									</Button>
								) : (
									<Button
										variant={content.amount === 0 ? 'outlined' : 'solid'}
										onClick={(e) => {
											e.preventDefault()
										}}
									>
										<LockClosedIcon className="mr-2 h-4 w-4" />
										Buy
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}
