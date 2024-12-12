import { FolderIcon, PhotoIcon, UsersIcon } from '@heroicons/react/20/solid'
import {
	Link,
	Outlet,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from '@remix-run/react'
import { useMemo } from 'react'
import { FilterByLicense } from './components/license-select/index.tsx'
import { FilterByOrientation } from './components/orientation-select/index.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'

import { PAGES } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { safeString } from '@/lib/strings.ts'

export function SearchModule() {
	const { query: queryParam } = useParams()
	const location = useLocation()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	const tabs = useMemo(
		() => [
			{
				name: 'Photos',
				href: PAGES.SEARCH.PHOTOS.replace(':query', safeString(queryParam)),
				icon: PhotoIcon,
				current:
					PAGES.SEARCH.PHOTOS.replace(':query', safeString(queryParam)) ===
					location.pathname,
			},
			{
				name: 'Collections',
				href: PAGES.SEARCH.COLLECTIONS.replace(
					':query',
					safeString(queryParam),
				),
				icon: FolderIcon,
				current:
					PAGES.SEARCH.COLLECTIONS.replace(':query', safeString(queryParam)) ===
					location.pathname,
			},
			{
				name: 'Creators',
				href: PAGES.SEARCH.CREATORS.replace(':query', safeString(queryParam)),
				icon: UsersIcon,
				current:
					PAGES.SEARCH.CREATORS.replace(':query', safeString(queryParam)) ===
					location.pathname,
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
			<Header isHeroSearchInVisible={false} />
			<div className="max-w-8xl mx-auto px-4 lg:px-8">
				<div>
					<div className="grid grid-cols-1 sm:hidden">
						<select
							value={activeTab}
							onChange={(e) => {
								navigate(
									tabs.find((tab) => tab.name === e.target.value)?.href ??
										PAGES.SEARCH.PHOTOS.replace(
											':query',
											safeString(queryParam),
										),
								)
							}}
							aria-label="Select a tab"
							className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
						>
							{tabs.map((tab) => (
								<option key={tab.name}>{tab.name}</option>
							))}
						</select>
					</div>
					<div className="hidden sm:block">
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
										<span
											className={classNames(
												tab.current
													? 'bg-blue-100 text-blue-600'
													: 'bg-gray-100 text-gray-900',
												'ml-1 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block',
											)}
										>
											1k
										</span>
									</Link>
								))}
							</nav>
							{activeTab === 'Photos' ? (
								<div className="flex flex-row items-center gap-3">
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
				<div className="mt-3">
					<h1 className="text-2xl font-black">{queryParam}</h1>
				</div>
				<Outlet />
			</div>
			<Footer />
		</>
	)
}
