import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'
import { Fragment, useState } from 'react'
import { NoticeBanner } from './notice-banner/index.tsx'
import { SearchPhotos } from './search/index.tsx'
import { SearchPhotosForMobile } from './search-for-mobile/index.tsx'
import { UserAccountMobileNav, UserAccountNav } from './user-account/index.tsx'
import { Button } from '@/components/button/index.tsx'
import { APP_NAME, PAGES } from '@/constants/index.ts'
import useScroll from '@/hooks/use-scroll.ts'
import { classNames } from '@/lib/classNames.ts'
import { useAuth } from '@/providers/auth/index.tsx'

const navigation = (isLoggedIn: boolean) => [
	{ name: 'Explore', href: PAGES.EXPLORE, routeType: 'link' },
	{ name: 'Upload', href: PAGES.AUTHENTICATED_PAGES.UPLOAD, routeType: 'link' },
	isLoggedIn
		? {
				name: 'My Account',
				href: PAGES.AUTHENTICATED_PAGES.ACCOUNT,
				routeType: 'link',
			}
		: undefined,
]

interface Props {
	isHeroSearchInVisible: boolean
	shouldHeaderBlur?: boolean
	searchQuery?: string
}

export const Header = ({
	isHeroSearchInVisible,
	shouldHeaderBlur = true,
	searchQuery,
}: Props) => {
	const { isLoggedIn } = useAuth()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const scrolled = useScroll(50)

	const headerBlurred = shouldHeaderBlur
		? 'bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg'
		: 'sticky top-0 z-50 bg-white '

	return (
		<header
			className={classNames({
				[headerBlurred]: !isHeroSearchInVisible && scrolled,
				'z sticky top-0 z-50 bg-white': !isHeroSearchInVisible && !scrolled,
			})}
		>
			<NoticeBanner />
			<nav
				className="max-w-8xl mx-auto flex items-center justify-between px-4 py-4 lg:px-8"
				aria-label="Global"
			>
				<Link to="/" prefetch="intent" className="-m-1.5 p-1.5">
					<div className="flex flex-row items-end">
						<span className="text-4xl font-extrabold text-blue-700">
							{APP_NAME.slice(0, 1)}
						</span>
						<span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
					</div>
				</Link>
				<div className="mx-8 hidden h-11 flex-grow md:flex">
					{isHeroSearchInVisible ? null : (
						<SearchPhotos searchQuery={searchQuery} />
					)}
				</div>
				<div className="flex lg:hidden">
					<button
						type="button"
						className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
						onClick={() => setMobileMenuOpen(true)}
					>
						<span className="sr-only">Open main menu</span>
						<Bars3Icon className="h-6 w-6" aria-hidden="true" />
					</button>
				</div>
				<div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-x-8">
					{navigation(isLoggedIn).map((item, idx) => {
						return (
							<Fragment key={idx}>
								{item ? (
									<Link
										to={item.href}
										prefetch="intent"
										className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-900"
									>
										{item.name}
									</Link>
								) : null}
							</Fragment>
						)
					})}
					{isLoggedIn ? (
						<UserAccountNav />
					) : (
						<Button href="/auth" variant="outlined" isLink>
							Sign In{' '}
							<span className="pl-1" aria-hidden="true">
								&rarr;
							</span>
						</Button>
					)}
				</div>
			</nav>
			{isHeroSearchInVisible ? null : (
				<div className="mx-4 pb-4 md:pb-0">
					<SearchPhotosForMobile searchQuery={searchQuery} />
				</div>
			)}
			<Dialog
				as="div"
				className="lg:hidden"
				open={mobileMenuOpen}
				onClose={setMobileMenuOpen}
			>
				<div className="fixed inset-0 z-10" />
				<Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
					<div className="flex items-center justify-between">
						<Link to="/" prefetch="intent" className="-m-1.5 p-1.5">
							<div className="flex flex-row items-end">
								<span className="text-4xl font-extrabold text-blue-500">
									{APP_NAME.slice(0, 1)}
								</span>
								<span className="text-4xl font-extrabold">
									{APP_NAME.slice(1)}
								</span>
							</div>
						</Link>
						<button
							type="button"
							className="-m-2.5 rounded-md p-2.5 text-gray-700"
							onClick={() => setMobileMenuOpen(false)}
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon className="h-6 w-6" aria-hidden="true" />
						</button>
					</div>
					<div className="mt-6 flow-root">
						<div className="-my-6 divide-y divide-gray-500/10">
							<div className="space-y-2 py-6">
								{navigation(isLoggedIn).map((item, idx) => {
									return (
										<Fragment key={idx}>
											{item && item.routeType === 'link' ? (
												<Link
													prefetch="intent"
													key={item.name}
													to={item.href}
													className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
												>
													{item.name}
												</Link>
											) : item && item.routeType === 'href' ? (
												<a
													onClick={() => setMobileMenuOpen(false)}
													href={item.href}
													className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
												>
													{item.name}
												</a>
											) : null}
										</Fragment>
									)
								})}
							</div>
							<div className="py-6">
								{isLoggedIn ? (
									<UserAccountMobileNav />
								) : (
									<Button href="/auth" variant="outlined" size="lg" isLink>
										Sign In
										<span className="pl-1" aria-hidden="true">
											&rarr;
										</span>
									</Button>
								)}
							</div>
						</div>
					</div>
				</Dialog.Panel>
			</Dialog>
		</header>
	)
}
