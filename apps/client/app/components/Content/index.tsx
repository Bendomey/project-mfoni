import { LockClosedIcon, HeartIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'
import { Image } from 'remix-image'
import { Button } from '../button/index.tsx'
import { PhotographerCreatorCard } from '../creator-card/index.tsx'
import { FlyoutContainer } from '../flyout/flyout-container.tsx'
import { blurDataURL, PAGES } from '@/constants/index.ts'

interface Props {
	content: Content
	showCreator?: boolean
}

export const Content = ({ content, showCreator = true }: Props) => {
	return (
		<Link
			to={PAGES.PHOTO.replace(':slug', content.slug)}
			state={{ modal: true }}
		>
			<div className="relative mb-5 cursor-zoom-in">
				<Image
					src={content.media.url}
					className="h-auto max-w-full rounded-lg"
					blurDataURL={blurDataURL}
					alt={content.title}
				/>

				<div className="group absolute top-0 h-full w-full rounded-lg hover:bg-black/50">
					<div className="flex h-full w-full flex-col justify-between p-2">
						<div className="flex flex-row items-center justify-between p-2">
							<div>
								{content.amount > 0 ? (
									<div className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
										mfoni+
									</div>
								) : null}
							</div>
							<div className="hidden group-hover:block">
								<Button variant="outlined" size="sm">
									<HeartIcon className="h-6 w-6 text-zinc-700" />
								</Button>
							</div>
						</div>
						<div className="hidden flex-row items-center justify-between gap-2.5 group-hover:flex">
							{showCreator && content.createdBy ? (
								<FlyoutContainer
									intendedPosition="y"
									FlyoutContent={PhotographerCreatorCard}
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
								<Button variant="outlined">
									<LockClosedIcon className="mr-2 h-4 w-4" />
									Download
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}
