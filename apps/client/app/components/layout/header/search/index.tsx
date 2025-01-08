import { Transition, Popover } from '@headlessui/react'
import {
	MagnifyingGlassIcon,
	ViewfinderCircleIcon,
} from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import { SearchPalette } from './search-palette/index.tsx'
import { VisualSearch } from './visual/index.tsx'

interface Props {
	isSittingOnADarkBackground?: true
	searchQuery?: string
}

export const SearchPhotos = ({
	isSittingOnADarkBackground,
	searchQuery,
}: Props) => {
	const [isSearchFocused, setIsSearchFocused] = useState(false)

	return (
		<div
			className={`relative block w-full rounded-full border-transparent border-zinc-300 hover:border focus:ring-0 ${
				isSearchFocused || isSittingOnADarkBackground
					? 'border bg-white'
					: 'bg-zinc-100'
			}`}
		>
			<div className="flex flex-row items-center">
				<div className="pointer-events-none inset-y-0 left-0 flex items-center pl-5">
					<MagnifyingGlassIcon
						className="h-5 w-5 text-gray-600"
						aria-hidden="true"
					/>
				</div>
				<div className="flex-grow">
					<div
						onClick={() => setIsSearchFocused(true)}
						className="flex h-11 w-full cursor-text items-center border-none bg-transparent py-2.5 pl-3 text-gray-900 placeholder:text-gray-500 focus:ring-0"
					>
						<span className="text-zinc-500">
							{searchQuery ?? 'Search for photos'}
						</span>
					</div>
					<SearchPalette
						searchQuery={searchQuery}
						isOpened={isSearchFocused}
						onClose={() => setIsSearchFocused(false)}
					/>
				</div>

				<div className="inset-y-0 right-0 flex items-center pr-6">
					<Popover className="relative">
						<Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 outline-none ring-0">
							<ViewfinderCircleIcon
								className="h-5 w-5 cursor-pointer text-gray-600"
								aria-hidden="true"
							/>
						</Popover.Button>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1"
						>
							<Popover.Panel className="absolute right-1 top-full z-30 mt-5 w-screen max-w-md overflow-hidden rounded-lg bg-white p-5 shadow-lg ring-1 ring-gray-900/5">
								<VisualSearch />
							</Popover.Panel>
						</Transition>
					</Popover>
				</div>
			</div>
		</div>
	)
}
