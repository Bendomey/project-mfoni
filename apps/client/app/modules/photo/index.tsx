import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
	ArchiveBoxArrowDownIcon,
	LockClosedIcon,
} from '@heroicons/react/16/solid'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
	CalendarDaysIcon,
	HeartIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Link, useLoaderData } from '@remix-run/react'
import dayjs from 'dayjs'
import { Image } from 'remix-image'
import { imageUrls } from '../landing-page/index.tsx'
import { RelatedContent } from './components/related-content.tsx'
import { Button } from '@/components/button/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { ShareButton } from '@/components/share-button/index.tsx'

import { UserImage } from '@/components/user-image.tsx'
import { blurDataURL, PAGES } from '@/constants/index.ts'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { getSizeStringForContent } from '@/lib/image-fns.ts'
import { safeString } from '@/lib/strings.ts'
import { useAuth } from '@/providers/auth/index.tsx'
import { type loader } from '@/routes/photos.$slug.ts'

const tags = [
	'wallpaper',
	'nature',
	'background',
	'love',
	'business',
	'money',
	'office',
	'people',
]

export const PhotoModule = () => {
	const { currentUser } = useAuth()
	const { content } = useLoaderData<typeof loader>()

	if (!content) return null

	const isContentMine = content.createdBy?.id === currentUser?.id
	return (
		<>
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
				<div>
					<div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
						<div className="flex items-center gap-2">
							<Link
								to={PAGES.CREATOR.PHOTOS.replace(
									':username',
									safeString(content.createdBy?.username),
								)}
							>
								<div className="mt-2 flex items-center gap-2">
									<UserImage
										name={safeString(content.createdBy?.name)}
										image={content.createdBy?.photo}
									/>
									<div className="flex flex-col">
										<span className="font-medium">
											{content.createdBy?.name}
										</span>
										<span className="text-xs font-medium text-gray-500">
											{content.createdBy?.username}
										</span>
									</div>
								</div>
							</Link>
							{isContentMine ? (
								<span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
									{content.visibility}
								</span>
							) : null}
						</div>

						<div className="flex flex-row items-center justify-between gap-2 md:justify-normal">
							<div className="flex gap-2">
								{/* <Button variant="outlined" size="sm">
                  <BookmarkIcon className="h-6 w-4 text-zinc-700 mr-1" />
                  Save
                </Button> */}
								{isContentMine ? null : (
									<Button
										disabled={Boolean(content.currentUserLike)}
										variant="outlined"
										size="sm"
									>
										<HeartIcon className="mr-1 h-6 w-4 text-zinc-700" />
										Like
									</Button>
								)}
							</div>
							{isContentMine || content.amount === 0 ? (
								<DownloadButton sizes={content.media.sizes} />
							) : (
								<Button color="success">
									<LockClosedIcon className="mr-1 size-4 text-white" />
									Buy {formatAmount(convertPesewasToCedis(content.amount))}
								</Button>
							)}
						</div>
					</div>

					<div className="my-10 flex justify-center md:mx-40 lg:mx-64">
						<Image
							src={content.media.url}
							alt={content.title}
							className="object-cover"
							blurDataURL={blurDataURL}
							options={{
								fit: 'cover',
							}}
						/>
					</div>

					<div className="flex flex-row items-start justify-between md:items-center">
						<div className="grid w-[50vw] grid-cols-1 gap-5 md:w-full md:grid-cols-5">
							<div className="text-sm">
								<h1 className="text-gray-500">Views</h1>
								<p className="font-semibold">{content.meta.views}</p>
							</div>
							<div className="text-sm">
								<h1 className="text-gray-500">Downloads</h1>
								<p className="font-semibold">{content.meta.views}</p>
							</div>
							<div className="text-sm">
								<h1 className="text-gray-500">Likes</h1>
								<p className="font-semibold">{content.meta.likes}</p>
							</div>
						</div>
						<div className="flex flex-row items-center gap-2">
							<ShareButton />
							<Button color="dangerGhost">Report</Button>
						</div>
					</div>

					<div className="mt-5">
						<h1 className="font-bold">{content.title}</h1>
						<div className="flex">
							{content.amount === 0 ? null : (
								<div className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
									mfoni+
								</div>
							)}
						</div>

						<div className="mt-5">
							<div className="flex flex-row items-center gap-2">
								<CalendarDaysIcon className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium text-gray-500">
									Published on {dayjs(content.createdAt).format('LL')}
								</span>
							</div>

							<div className="mt-2 flex flex-row items-center gap-2">
								<ShieldCheckIcon className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium text-gray-500">
									Free to use under the mfoni License
								</span>
							</div>
						</div>

						<div className="mt-10 flex flex-wrap items-center gap-2">
							{content.tags?.map((tag, index) => (
								<Link key={index} to={PAGES.TAG.replace(':tag', tag.slug)}>
									<div className="rounded bg-gray-100 px-3 py-2">
										<span className="text-sm font-medium text-gray-600">
											{tag.name}
										</span>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
				<div className="mt-10">
					<RelatedContent />
				</div>
			</div>
			<Footer />
		</>
	)
}

interface Props {
	sizes: ContentMediaSizes
}

export default function DownloadButton({ sizes }: Props) {
	const items = [
		{ name: 'Small', size: getSizeStringForContent(sizes.small) },
		{ name: 'Medium', size: getSizeStringForContent(sizes.medium) },
		{ name: 'Large', size: getSizeStringForContent(sizes.large) },
	]

	return (
		<div className="inline-flex rounded-md shadow-sm">
			<button
				type="button"
				className="relative inline-flex items-center rounded-l-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 focus:z-10"
			>
				Download
			</button>
			<Menu as="div" className="relative -ml-px block">
				<MenuButton className="relative inline-flex items-center rounded-r-md border-l border-gray-200 bg-green-600 px-2 py-2 text-white hover:bg-green-800 focus:z-10">
					<span className="sr-only">Open options</span>
					<ChevronDownIcon aria-hidden="true" className="size-5" />
				</MenuButton>
				<MenuItems
					transition
					className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
				>
					<div className="py-1">
						{items.map((item) => (
							<MenuItem key={item.name}>
								<button className="flex w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
									{item.name}{' '}
									<span className="ml-1 text-xs text-gray-400">
										({item.size})
									</span>
								</button>
							</MenuItem>
						))}

						<MenuItem>
							<button className="flex w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none">
								Original{' '}
								<span className="ml-1 text-xs text-gray-400">
									({getSizeStringForContent(sizes.original)})
								</span>
							</button>
						</MenuItem>
					</div>
				</MenuItems>
			</Menu>
		</div>
	)
}
