import {
	Combobox,
	ComboboxInput,
	Dialog,
	DialogPanel,
	DialogBackdrop,
} from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import * as outline from '@heroicons/react/24/outline'
import { useNavigate } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '@/components/button/index.tsx'
import { classNames } from '@/lib/classNames.ts'

interface Props {
	isOpened: boolean
	onClose: () => void
	searchQuery?: string
}

export function SearchPalette({ isOpened, onClose, searchQuery }: Props) {
	const [rawQuery, setRawQuery] = useState(() => searchQuery ?? '')
	const navigate = useNavigate()

	return (
		<Dialog
			className="relative z-50"
			open={isOpened}
			onClose={() => {
				onClose()
				setRawQuery('')
			}}
		>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
				<DialogPanel
					transition
					className="mx-auto transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl outline outline-2 outline-offset-1 outline-blue-300 ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in md:w-5/6 lg:w-4/6"
				>
					<Combobox>
						<div className="m-1 grid grid-cols-1">
							<ComboboxInput
								autoFocus
								className="col-start-1 row-start-1 h-12 w-full border-0 pl-11 pr-4 text-base text-gray-900 outline-none outline-0 placeholder:text-gray-400 sm:text-sm"
								placeholder="Search..."
								value={rawQuery}
								onChange={(event) => setRawQuery(event.target.value)}
								onKeyUp={(event) => {
									event.preventDefault()
									if (event.key === 'Escape') {
										onClose()
									}
									if (event.key === 'Enter' && rawQuery.trim().length) {
										onClose()
										navigate(`/search/photos/${rawQuery}`)
									}
								}}
								onBlur={() => setRawQuery('')}
							/>
							<MagnifyingGlassIcon
								className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
								aria-hidden="true"
							/>
						</div>

						{rawQuery === '?' && (
							<div className="px-6 py-14 text-center text-sm sm:px-14">
								<outline.LifebuoyIcon
									className="mx-auto size-6 text-gray-400"
									aria-hidden="true"
								/>
								<p className="mt-4 font-semibold text-gray-900">
									Help with searching
								</p>
								<p className="mt-2 text-gray-500">
									Use this tool to quickly search for photos, collections and
									creators across our entire platform. The search modifiers
									found in the footer below will help you to navigate how to
									make use of this search tool.
								</p>
							</div>
						)}

						<div className="flex flex-wrap items-center bg-blue-50 px-4 py-2.5 text-xs text-gray-700">
							Type{' '}
							<kbd
								className={classNames(
									'mx-1 flex size-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
									rawQuery === '?'
										? 'border-indigo-600 text-indigo-600'
										: 'border-gray-400 text-gray-900',
								)}
							>
								?
							</kbd>{' '}
							for help,
							<kbd
								className={classNames(
									'mx-1 flex h-5 w-8 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
									rawQuery.startsWith('#')
										? 'border-indigo-600 text-indigo-600'
										: 'border-gray-400 text-gray-900',
								)}
							>
								Esc
							</kbd>{' '}
							<span>to close and</span>
							<kbd
								className={classNames(
									'mx-1 flex h-5 w-11 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
									rawQuery.startsWith('>')
										? 'border-indigo-600 text-indigo-600'
										: 'border-gray-400 text-gray-900',
								)}
							>
								Enter
							</kbd>{' '}
							to initiate search.
						</div>
					</Combobox>
				</DialogPanel>
				<DialogPanel
					transition
					className="mx-auto mt-5 transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white p-3 shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in md:w-5/6 lg:w-4/6"
				>
					<div>
						<div className="flex flex-row items-center justify-between">
							<h1 className="text-base font-bold md:text-lg">
								Recent Searches
							</h1>
							<Button
								variant="unstyled"
								className="text-sm text-zinc-400 hover:underline"
							>
								Clear
							</Button>
						</div>
						<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
							{[
								'Nature',
								'People',
								'Food',
								'Animals',
								'Architecture',
								'Interiors',
								'Current Events',
								'Business & Work',
							].map((item, index) => (
								<Button size="sm" key={index} variant="outlined">
									<div className="font-base flex flex-row items-center text-gray-600">
										{' '}
										<MagnifyingGlassIcon className="mr-2 h-3 w-3" /> {item}
									</div>
								</Button>
							))}
						</div>
					</div>
					<div className="mt-5">
						<div className="mt-5 flex flex-row items-center justify-between">
							<h1 className="text-base font-bold md:text-lg">
								🚀 Trending Collections
							</h1>
						</div>
						<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
							{[
								'Nature',
								'People',
								'Food',
								'Animals',
								'Architecture',
								'Interiors',
								'Current Events',
								'Business & Work',
							].map((item, index) => (
								<Button size="sm" key={index} variant="outlined">
									<div className="flex flex-row items-center">
										{' '}
										<outline.ArrowTrendingUpIcon className="mr-2 h-5 w-5" />{' '}
										{item}
									</div>
								</Button>
							))}
						</div>
					</div>
					<div className="mt-5">
						<div className="mt-5 flex flex-row items-center justify-between">
							<h1 className="text-base font-bold md:text-lg">
								Popular Tags 🔥
							</h1>
						</div>
						<div className="mt-4 flex flex-row flex-wrap items-center gap-3">
							{[
								'Nature',
								'People',
								'Food',
								'Animals',
								'Architecture',
								'Interiors',
								'Current Events',
								'Business & Work',
							].map((item, index) => (
								<Button key={index} variant="outlined">
									<div className="flex flex-row items-center">
										<outline.RectangleGroupIcon className="mr-2 h-5 w-5" />{' '}
										{item}
									</div>
								</Button>
							))}
						</div>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	)
}
