import { ClockIcon } from '@heroicons/react/20/solid'
import {
	LockClosedIcon,
	HeartIcon as HeartIconOutline,
	ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import {
	HeartIcon as HeartIconSolid,
	StarIcon,
	XCircleIcon,
} from '@heroicons/react/24/solid'
import { Link, useNavigate } from '@remix-run/react'
import { useMemo } from 'react'
import { Image } from 'remix-image'
import { Button } from '../button/index.tsx'
import { PhotographerCreatorCard } from '../creator-card/index.tsx'
import { DownloadButtonApi } from '../download-button.tsx'
import { FlyoutContainer } from '../flyout/flyout-container.tsx'
import { LikeButton } from '@/components/like-button.tsx'
import { blurDataURL, PAGES } from '@/constants/index.ts'
import { useValidateImage } from '@/hooks/use-validate-image.tsx'
import { classNames } from '@/lib/classNames.ts'
import { getNameInitials } from '@/lib/misc.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	content: Content
	showCreator?: boolean
	showTags?: boolean
	className?: string
}

export const Content = ({ content, showCreator = true, className }: Props) => {
	const { currentUser } = useAuth()
	const navigate = useNavigate()

	const isContentMine = content.createdById === currentUser?.id

	const canUserDownload = useMemo(() => {
		if (isContentMine) {
			return true
		}

		if (content?.amount === 0) {
			return true
		}

		if (content?.amount && content?.amount > 0 && content?.isPurchased) {
			return true
		}

		return false
	}, [content, isContentMine])
	return (
		<Link
			to={PAGES.PHOTO.replace(':slug', content.slug)}
			state={{ modal: true }}
		>
			<div className={classNames('relative cursor-zoom-in', className)}>
				<Image
					src={content.media.url}
					className="h-full w-full rounded-lg object-cover"
					blurDataURL={blurDataURL}
					alt={content.title}
				/>
				<div className="group absolute top-0 h-full w-full rounded-lg hover:bg-black/50">
					<div className="flex h-full w-full flex-col justify-between p-4">
						<div className="flex flex-row items-center justify-between">
							<div className="flex items-center gap-1">
								{content.amount > 0 ? (
									<FlyoutContainer
										intendedPosition="y"
										FlyoutContent={
											<div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-black px-3 py-4 shadow-xl">
												<h3 className="text-center text-sm font-bold text-white">
													This is a premium image
												</h3>
											</div>
										}
									>
										<div className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
											mfoni+
										</div>
									</FlyoutContainer>
								) : null}
								{content.status === 'REJECTED' ? (
									<FlyoutContainer
										intendedPosition="y"
										FlyoutContent={
											<div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-black px-3 py-4 shadow-xl">
												<h3 className="text-center text-sm font-bold text-white">
													{content.imageProcessingResponse?.message ??
														'Something happened while processing your image.'}
												</h3>
											</div>
										}
									>
										<div className="gap-.5 flex items-center rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
											<XCircleIcon className="size-5" />
											Rejected
										</div>
									</FlyoutContainer>
								) : content.status === 'PROCESSING' ? (
									<FlyoutContainer
										intendedPosition="y"
										FlyoutContent={
											<div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-black px-3 py-4 shadow-xl">
												<h3 className="text-center text-sm font-bold text-white">
													Processing image
												</h3>
											</div>
										}
									>
										<div className="rounded-full bg-blue-600 px-1 py-1 text-sm font-semibold text-white">
											<ClockIcon className="size-5" />
										</div>
									</FlyoutContainer>
								) : content.visibility === 'PRIVATE' ? (
									<FlyoutContainer
										intendedPosition="y"
										FlyoutContent={
											<div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-black px-3 py-4 shadow-xl">
												<h3 className="text-center text-sm font-bold text-white">
													This image is hidden from the public
												</h3>
											</div>
										}
									>
										<div className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
											Hidden
										</div>
									</FlyoutContainer>
								) : null}
							</div>

							<div className="flex items-center gap-4">
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
								{content.isFeatured ? (
									<div>
										<FlyoutContainer
											intendedPosition="y"
											FlyoutContent={
												<div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-black px-3 py-4 shadow-xl">
													<h3 className="text-center text-sm font-bold text-white">
														This image is featured
													</h3>
												</div>
											}
										>
											<StarIcon className="h-7 w-7 text-white" />
										</FlyoutContainer>
									</div>
								) : null}
							</div>
						</div>
						<div className="hidden w-full flex-row items-center justify-between gap-2.5 group-hover:flex">
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
									<div
										className="flex items-center"
										onClick={(e) => {
											e.preventDefault()
											navigate(
												PAGES.CREATOR.PHOTOS.replace(
													':username',
													safeString(content?.createdBy?.username),
												),
											)
										}}
									>
										<CreatedByCard createdBy={content.createdBy} />
										<span className="ml-2 truncate text-sm font-medium text-white">
											{content.createdBy.name}
										</span>
									</div>
								</FlyoutContainer>
							) : (
								<div />
							)}

							<div className="flex justify-end">
								{canUserDownload ? (
									<DownloadButtonApi content={content}>
										{({ isDisabled, onClick }) => (
											<Button
												disabled={isDisabled}
												variant="outlined"
												onClick={(e) => {
													e.preventDefault()
													onClick('MEDIUM')
												}}
											>
												<ArrowDownTrayIcon className="mr-2 h-4 w-4" />
												Download
											</Button>
										)}
									</DownloadButtonApi>
								) : (
									<Button
										variant={content.amount === 0 ? 'outlined' : 'solid'}
										onClick={(e) => {
											e.preventDefault()
											navigate(
												`${PAGES.PHOTO.replace(
													':slug',
													content.slug,
												)}?buy=true`,
											)
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

interface CreatedByCardProps {
	createdBy: BasicCreator
}

const CreatedByCard = ({ createdBy }: CreatedByCardProps) => {
	const isProfilePhotoValid = useValidateImage(safeString(createdBy?.photo))
	const initials = getNameInitials(safeString(createdBy?.name))

	return (
		<div className="flex">
			{isProfilePhotoValid && createdBy?.photo ? (
				<Image
					className="inline-block h-7 w-7 rounded-full"
					src={createdBy.photo}
					alt={createdBy.name}
				/>
			) : (
				<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white ring-1 ring-white">
					<span className="text-xs font-medium leading-none">{initials}</span>
				</span>
			)}
		</div>
	)
}
