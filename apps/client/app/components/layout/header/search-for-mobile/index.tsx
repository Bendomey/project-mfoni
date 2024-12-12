import { Transition, Dialog } from '@headlessui/react'
import {
	MagnifyingGlassIcon,
	ViewfinderCircleIcon,
} from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Fragment, useState } from 'react'
import { TextSearch } from '../search/text/index.tsx'
import { VisualSearch } from '../search/visual/index.tsx'
import { Button } from '@/components/button/index.tsx'

interface Props {
	onClose: VoidFunction
}

const MENUS = {
	TEXT_SEARCH: 'TEXT_SEARCH',
	VISUAL_SEARCH: 'VISUAL_SEARCH',
}

const SearchModal = ({ onClose }: Props) => {
	const [activeMenu, setActiveMenu] = useState(MENUS.TEXT_SEARCH)

	return (
		<div className="py-2">
			<div className="flex flex-row items-center justify-between px-3">
				<div />
				<div>
					<div className="flex flex-row items-center rounded-lg bg-zinc-100">
						<button
							onClick={() => setActiveMenu(MENUS.TEXT_SEARCH)}
							type="button"
							className={`p-4 ${
								activeMenu === MENUS.TEXT_SEARCH
									? 'rounded-l-lg bg-zinc-300'
									: ''
							} `}
						>
							<MagnifyingGlassIcon className="h-5 w-5" />
						</button>
						<button
							onClick={() => setActiveMenu(MENUS.VISUAL_SEARCH)}
							type="button"
							className={`p-4 ${
								activeMenu === MENUS.VISUAL_SEARCH
									? 'rounded-r-lg bg-zinc-300'
									: ''
							} `}
						>
							<ViewfinderCircleIcon className="h-5 w-5" />
						</button>
					</div>
				</div>
				<Button onClick={onClose} variant="unstyled">
					<XMarkIcon className="h-7 w-7 text-zinc-600" />
				</Button>
			</div>

			{activeMenu === MENUS.TEXT_SEARCH ? (
				<>
					<div className="mt-5">
						<input
							type="text"
							className="w-full rounded-md border-none bg-zinc-100 py-3 text-gray-900 placeholder:text-gray-500 focus:ring-0"
							placeholder="Search for photos"
						/>
					</div>
					<div className="-mx-2 mt-5 h-[58vh] overflow-y-scroll px-2">
						<TextSearch />
					</div>
				</>
			) : null}

			{activeMenu === MENUS.VISUAL_SEARCH ? <VisualSearch /> : null}
		</div>
	)
}

export const SearchPhotosForMobile = () => {
	const [isSearchFocused, setIsSearchFocused] = useState(false)

	return (
		<>
			<div className="flex md:hidden">
				<Button
					variant="unstyled"
					onClick={() => setIsSearchFocused(true)}
					className="flex-start block flex w-full items-center rounded-full border border-zinc-400 bg-white px-5 py-2 text-base font-medium text-gray-400"
				>
					<MagnifyingGlassIcon className="mr-3 h-5 w-5 text-zinc-400" />
					Search for photos
				</Button>
			</div>
			<Transition show={isSearchFocused} as={Fragment}>
				<Dialog onClose={() => setIsSearchFocused(false)} className="">
					<div className="fixed inset-0 bg-black/50" aria-hidden="true" />
					<Transition.Child
						as={Fragment}
						enter="transition ease-out duration-200"
						enterFrom="opacity-0 translate-y-1"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in duration-150"
						leaveFrom="opacity-100 translate-y-0"
						leaveTo="opacity-0 translate-y-1"
					>
						<div className="absolute bottom-0 z-50 mt-2 h-[80vh] w-screen overflow-hidden rounded-lg rounded-t-xl border border-zinc-200 bg-white p-2 shadow-lg ring-1 ring-gray-900/5">
							<SearchModal onClose={() => setIsSearchFocused(false)} />
						</div>
					</Transition.Child>
				</Dialog>
			</Transition>
		</>
	)
}
