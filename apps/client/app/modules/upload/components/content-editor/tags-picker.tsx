import { Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import {
	InformationCircleIcon,
	PlusCircleIcon,
} from '@heroicons/react/24/outline'
import { useCallback, useMemo, useState } from 'react'
import { useGetTags } from '@/api/tags/index.ts'
import { Loader } from '@/components/loader/index.tsx'
import OutsideListener from '@/components/outside-listener/index.tsx'
import { useDebouncedState } from '@/hooks/use-debounce.ts'
import { classNames } from '@/lib/classNames.ts'
import { getMatchingStrings } from '@/lib/strings.ts'

interface Props {
	tags: StringList
	setTags: (tags: StringList) => void
}

export function TagsPicker({
	tags: selectedTags,
	setTags: setSelectedTags,
}: Props) {
	const [openPopover, setOpenPopover] = useState(false)
	const [query, setQuery, debouncedQuery] = useDebouncedState<string>('', {
		delay: 500,
	})

	const { data, isPending } = useGetTags({
		pagination: {
			per: 10,
			page: 0,
		},
		search: {
			query: debouncedQuery,
		},
	})

	const selectTag = useCallback(
		(tag: string) => {
			const matchingStrings = getMatchingStrings(tag, selectedTags)

			if (matchingStrings.length) {
				return selectedTags
			}

			setSelectedTags([...selectedTags, tag])
			setQuery('')
		},
		[selectedTags, setQuery, setSelectedTags],
	)

	const unselectedData = useMemo(() => {
		if (!data) {
			return []
		}

		return data.rows.filter((tag) => {
			const matchingStrings = getMatchingStrings(tag.name, selectedTags)
			return !matchingStrings.length
		})
	}, [data, selectedTags])

	return (
		<OutsideListener onClick={() => setOpenPopover(false)}>
			<div
				aria-hidden="true"
				className="relative"
				onClick={() => setOpenPopover(true)}
			>
				<div className="flex w-full flex-wrap items-center gap-2 rounded-md bg-white px-3 py-2 text-left">
					{selectedTags.map((tag, i) => (
						<span
							key={i}
							className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
						>
							{tag}
							<button
								onClick={() =>
									setSelectedTags(selectedTags.filter((t) => t !== tag))
								}
								type="button"
								className="group relative -mr-1 ml-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
							>
								<span className="sr-only">Remove</span>
								<svg
									viewBox="0 0 14 14"
									className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75"
								>
									<path d="M4 4l6 6m0-6l-6 6" />
								</svg>
								<span className="absolute -inset-1" />
							</button>
						</span>
					))}
					<div>
						<input
							type="text"
							name="text"
							id="tags"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="w-auto rounded-md border-0 text-lg font-bold text-gray-900 ring-0 ring-inset ring-gray-300 placeholder:font-medium placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-blue-600 sm:leading-6"
							placeholder="Enter Tags"
							autoComplete="off"
						/>
					</div>
				</div>
				<Transition show={openPopover}>
					<div className="absolute left-0 z-10 mt-2 w-full divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in">
						<div className="py-1">
							<div
								aria-hidden="true"
								onClick={query ? () => selectTag(query) : undefined}
								className={classNames(
									'group flex items-center px-4 py-2',
									query.trim().length
										? 'cursor-pointer hover:bg-gray-100 hover:text-gray-900'
										: 'text-gray-700',
								)}
							>
								{query.trim().length ? (
									<>
										<PlusCircleIcon
											className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
											aria-hidden="true"
										/>
										{query}
									</>
								) : (
									<>
										<MagnifyingGlassIcon
											className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
											aria-hidden="true"
										/>
										Search for tags
									</>
								)}
							</div>
							{isPending ? (
								<div className="my-2 flex justify-center">
									<Loader />
								</div>
							) : data ? (
								unselectedData.length ? (
									unselectedData.map((tag) => (
										<div
											onClick={() => selectTag(tag.name)}
											key={tag.id}
											aria-hidden="true"
											className={classNames(
												'group flex cursor-pointer items-center px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900',
											)}
										>
											{tag.name}
										</div>
									))
								) : null
							) : (
								// ) : (
								//   <span className="mx-4 my-2 gap-2 inline-flex items-center rounded-md bg-yellow-50 px-2 py-2 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
								//     <InformationCircleIcon className="h-5 w-auto text-yellow-700" />
								//     <span className="text-sm text-gray-600">
								//       No tags available
								//     </span>
								//   </span>
								// )
								<span className="mx-4 my-2 inline-flex items-center gap-2 rounded-md bg-pink-50 px-2 py-2 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10">
									<InformationCircleIcon className="h-5 w-auto text-red-700" />
									<span className="text-sm text-gray-600">
										There was error fetching tags. Try again later.
									</span>
								</span>
							)}
						</div>
					</div>
				</Transition>
			</div>
		</OutsideListener>
	)
}
