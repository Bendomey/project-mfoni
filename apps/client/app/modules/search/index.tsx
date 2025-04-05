import { FolderIcon, PhotoIcon, UsersIcon } from '@heroicons/react/20/solid'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import {
	Link,
	Outlet,
	useLocation,
	useParams,
	useSearchParams,
} from '@remix-run/react'
import { useMemo } from 'react'
import { FiltersDialog } from './components/filters-dialog/index.tsx'
import { FilterByLicense } from './components/license-select/index.tsx'
import { FilterByOrientation } from './components/orientation-select/index.tsx'
import { Button } from '@/components/button/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'

import { PAGES } from '@/constants/index.ts'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { classNames } from '@/lib/classNames.ts'
import { safeString } from '@/lib/strings.ts'

export function SearchModule() {
	const { query: queryParam } = useParams()
	const location = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const filterModalState = useDisclosure()

	const tabs = useMemo(
		() => [
			{
				name: 'Photos',
				href: PAGES.SEARCH.PHOTOS.replace(':query', safeString(queryParam)),
				icon: PhotoIcon,
				current:
					encodeURI(
						PAGES.SEARCH.PHOTOS.replace(':query', safeString(queryParam)),
					) === location.pathname,
			},
			{
				name: 'Collections',
				href: PAGES.SEARCH.COLLECTIONS.replace(
					':query',
					safeString(queryParam),
				),
				icon: FolderIcon,
				current:
					encodeURI(
						PAGES.SEARCH.COLLECTIONS.replace(':query', safeString(queryParam)),
					) === location.pathname,
			},
			{
				name: 'Creators',
				href: PAGES.SEARCH.CREATORS.replace(':query', safeString(queryParam)),
				icon: UsersIcon,
				current:
					encodeURI(
						PAGES.SEARCH.CREATORS.replace(':query', safeString(queryParam)),
					) === location.pathname,
			},
		],
		[location.pathname, queryParam],
	)

	const activeTab = tabs.find((tab) => tab.current)?.name ?? 'Photos'

	const showClearButton =
		searchParams.get('license') || searchParams.get('orientation')

	const clearFilters = () => {
		searchParams.delete('license')
		searchParams.delete('orientation')
		setSearchParams(searchParams)
	}

	return (
		<>
			<Header isHeroSearchInVisible={false} searchQuery={queryParam} />
			<div className="max-w-8xl mx-auto">
				<div className='px-4 lg:px-5'>
					<div className="">
						<div className="flex items-center justify-between border-b border-gray-200">
							<nav aria-label="Tabs" className="-mb-px flex space-x-8">
								{tabs.map((tab) => (
									<Link
										prefetch="intent"
										key={tab.name}
										to={tab.href}
										aria-current={tab.current ? 'page' : undefined}
										className={classNames(
											tab.current
												? 'border-blue-500 text-blue-600'
												: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
											'group inline-flex items-center border-b-2 px-1 py-3 text-sm font-medium',
										)}
									>
										<tab.icon
											aria-hidden="true"
											className={classNames(
												tab.current
													? 'text-blue-500'
													: 'text-gray-400 group-hover:text-gray-500',
												'-ml-0.5 mr-2 size-5',
											)}
										/>
										<span>{tab.name}</span>
										{/* <span
											className={classNames(
												tab.current
													? 'bg-blue-100 text-blue-600'
													: 'bg-gray-100 text-gray-900',
												'ml-1 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block',
											)}
										>
											1k
										</span> */}
									</Link>
								))}
							</nav>
							{activeTab === 'Photos' ? (
								<div className="hidden flex-row items-center gap-3 lg:flex">
									{showClearButton ? (
										<button
											onClick={clearFilters}
											className="text-xs text-gray-500"
										>
											Clear
										</button>
									) : null}

									<FilterByLicense />
									<FilterByOrientation />
								</div>
							) : null}
						</div>
					</div>
				</div>
				{activeTab === 'Photos' ? (
					<div className="mt-5 flex justify-end lg:hidden px-4 lg:px-5">
						<Button
							onClick={filterModalState.onOpen}
							size="sm"
							color="secondaryGhost"
						>
							<AdjustmentsHorizontalIcon className="mr-2 h-auto w-5" /> Filters{' '}
							{searchParams.size > 0 ? `(${searchParams.size})` : ''}
						</Button>
					</div>
				) : null}

				<div className='px-0 md:px-5'>
					<Outlet />

				</div>
			</div>
			<Footer />
			<FiltersDialog
				isOpened={filterModalState.isOpened}
				onClose={filterModalState.onClose}
			/>
		</>
	)
}
