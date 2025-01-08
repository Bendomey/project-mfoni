import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import {
	MagnifyingGlassIcon,
	ViewfinderCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { SearchPalette } from '../search/search-palette/index.tsx'
import { VisualSearch } from '../search/visual/index.tsx'
import { Button } from '@/components/button/index.tsx'

interface Props {
	onClose: VoidFunction
	isOpened: boolean
	searchQuery?: string
}

const MENUS = {
	TEXT_SEARCH: 'TEXT_SEARCH',
	VISUAL_SEARCH: 'VISUAL_SEARCH',
}

const SearchModal = ({ isOpened, onClose, searchQuery }: Props) => {
	const [activeMenu, setActiveMenu] = useState<string>('')

	return (
		<Dialog
			className="relative z-50"
			open={isOpened}
			onClose={() => {
				onClose()
				setActiveMenu('')
			}}
		>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-10 flex w-screen flex-col justify-center overflow-y-auto p-4 sm:p-6 md:p-20">
				{activeMenu === MENUS.VISUAL_SEARCH ? (
					<DialogPanel
						transition
						className="mx-auto w-auto transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-zinc-100 p-3 shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
					>
						<VisualSearch />
					</DialogPanel>
				) : null}

				{activeMenu === MENUS.TEXT_SEARCH ? (
					<SearchPalette
						isOpened={true}
						onClose={() => {
							onClose()
							setActiveMenu('')
						}}
						searchQuery={searchQuery}
					/>
				) : null}

				{activeMenu === '' ? (
					<>
						<DialogPanel
							transition
							className="mx-auto flex w-auto transform items-center justify-center divide-y divide-gray-100 overflow-hidden rounded-xl bg-zinc-100 shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
						>
							<button
								onClick={() => setActiveMenu(MENUS.TEXT_SEARCH)}
								type="button"
								className={`mx-10 p-4`}
							>
								<MagnifyingGlassIcon className="size-20 text-zinc-400" />
								<h1 className="text-lg font-bold">Textual Search</h1>
							</button>
						</DialogPanel>
						<DialogPanel
							transition
							className="mx-auto mt-5 flex w-auto transform items-center justify-center divide-y divide-gray-100 overflow-hidden rounded-xl bg-zinc-100 shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
						>
							<button
								onClick={() => setActiveMenu(MENUS.VISUAL_SEARCH)}
								type="button"
								className={`mx-10 p-4`}
							>
								<ViewfinderCircleIcon className="size-20 text-zinc-400" />
								<h1 className="text-lg font-bold">Visual Search</h1>
							</button>
						</DialogPanel>
					</>
				) : null}
			</div>
		</Dialog>
	)
}

interface SearchPhotosForMobileProps {
	searchQuery?: string
}

export const SearchPhotosForMobile = ({
	searchQuery,
}: SearchPhotosForMobileProps) => {
	const [isSearchFocused, setIsSearchFocused] = useState(false)

	return (
		<>
			<div className="flex md:hidden">
				<Button
					variant="outlined"
					onClick={() => setIsSearchFocused(true)}
					className="flex-start flex w-full items-center justify-start rounded-full px-5 py-3 text-base font-medium text-gray-400"
				>
					<MagnifyingGlassIcon className="mr-3 h-5 w-5 text-zinc-400" />
					{searchQuery ?? 'Search for photos'}
				</Button>
			</div>
			<SearchModal
				isOpened={isSearchFocused}
				onClose={() => setIsSearchFocused(false)}
			/>
		</>
	)
}
