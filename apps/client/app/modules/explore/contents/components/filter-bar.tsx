import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from '@remix-run/react'
import { useMemo } from 'react'
import { Button } from '@/components/button/index.tsx'
import { useDisclosure } from '@/hooks/use-disclosure.tsx'
import { FiltersDialog } from '@/modules/search/components/filters-dialog/index.tsx'
import { FilterByLicense } from '@/modules/search/components/license-select/index.tsx'
import { FilterByOrientation } from '@/modules/search/components/orientation-select/index.tsx'

export function FilterBar() {
	const filterModalState = useDisclosure()
	const [searchParams, setSearchParams] = useSearchParams()

	const showClearButton =
		searchParams.get('license') || searchParams.get('orientation')

	const clearFilters = () => {
		searchParams.delete('license')
		searchParams.delete('orientation')
		setSearchParams(searchParams)
	}

	const filterSize = useMemo(() => {
		let size = 0
		if (searchParams.has('license')) {
			size++
		}
		if (searchParams.has('orientation')) {
			size++
		}

		return size
	}, [searchParams])

	return (
		<div className="px-3 md:px-0">
			<div className="my-10 flex items-end justify-between">
				<div>
					<div className="mb-3">
						<h1 className="text-4xl font-black">All Contents</h1>
					</div>
					<p className="text-zinc-500 md:w-2/3">
						mfoni offers millions of free, high-quality pictures. All pictures
						are free to download and use under the mfoni license.
					</p>
				</div>
				<div className="hidden flex-row items-center gap-3 lg:flex">
					{showClearButton ? (
						<button onClick={clearFilters} className="text-xs text-gray-500">
							Clear
						</button>
					) : null}
					<FilterByLicense />
					<FilterByOrientation />
				</div>
			</div>
			<div className="mb-5 flex justify-end lg:hidden">
				<Button
					onClick={filterModalState.onOpen}
					size="sm"
					color="secondaryGhost"
				>
					<AdjustmentsHorizontalIcon className="mr-2 h-auto w-5" /> Filters{' '}
					{filterSize > 0 ? `(${searchParams.size})` : ''}
				</Button>
			</div>
			<FiltersDialog
				isOpened={filterModalState.isOpened}
				onClose={filterModalState.onClose}
			/>
		</div>
	)
}
