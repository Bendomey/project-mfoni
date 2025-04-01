import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '@/components/button/index.tsx'
import { Modal } from '@/components/modal/index.tsx'

interface Props {
	isOpened: boolean
	onClose: () => void
}

export const licenses = [
	{
		label: 'All',
		value: 'ALL',
	},
	{
		label: 'Free',
		value: 'FREE',
	},
	{
		label: 'mfoni +',
		value: 'PREMIUM',
	},
]

export const orientations = [
	{
		label: 'All',
		value: 'ALL',
	},
	{
		label: 'Landscape',
		value: 'LANDSCAPE',
	},
	{
		label: 'Portrait',
		value: 'PORTRAIT',
	},
	{
		label: 'Square',
		value: 'SQUARE',
	},
]

export function FiltersDialog({ isOpened, onClose }: Props) {
	const [searchParams, setSearchParams] = useSearchParams()
	const [selectedLicense, setSelectedLicense] = useState(
		() => searchParams.get('license') ?? 'ALL',
	)
	const [selectedOrientation, setSelectedOrientation] = useState(
		() => searchParams.get('orientation') ?? 'ALL',
	)

	const clearFilters = () => {
		searchParams.delete('license')
		searchParams.delete('orientation')
		setSelectedLicense('ALL')
		setSelectedOrientation('ALL')
		setSearchParams(searchParams)
		onClose()
	}

	const handleApply = () => {
		if (selectedLicense === 'ALL') {
			searchParams.delete('license')
		} else {
			searchParams.set('license', selectedLicense)
		}

		if (selectedOrientation === 'ALL') {
			searchParams.delete('orientation')
		} else {
			searchParams.set('orientation', selectedLicense)
		}

		setSearchParams(searchParams)
		onClose()
	}

	const enableClearButton = !Boolean(
		searchParams.get('license') ?? searchParams.get('orientation'),
	)

	const areThereChanges = Boolean(
		(searchParams.get('license') ?? 'ALL') !== selectedLicense ||
			(searchParams.get('orientation') ?? 'ALL') !== selectedOrientation,
	)

	return (
		<Modal
			className="w-full p-0 md:w-2/3 lg:w-1/3"
			isOpened={isOpened}
			onClose={onClose}
		>
			<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
				<h1 className="font-bold">Filters</h1>
				<button>
					<XMarkIcon className="h-5 w-auto text-gray-500" onClick={onClose} />
				</button>
			</div>
			<div className="my-5 border-b border-gray-200 pb-5">
				<div className="mx-4">
					<h1 className="font-medium">License</h1>
					<ul className="mt-3">
						{licenses.map((license) => (
							<li
								onClick={() => setSelectedLicense(license.value)}
								key={license.value}
								className="mt-2 grid cursor-pointer grid-cols-8 gap-3"
							>
								<div>
									{license.value === selectedLicense ? (
										<CheckIcon className="h-auto w-4" />
									) : null}
								</div>
								<div className="col-span-7">
									<span>{license.label}</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="mb-10">
				<div className="mx-4">
					<h1 className="font-medium">Orientation</h1>
					<ul className="mt-3">
						{orientations.map((orientation) => (
							<li
								onClick={() => setSelectedOrientation(orientation.value)}
								key={orientation.value}
								className="mt-2 grid cursor-pointer grid-cols-8 gap-3"
							>
								<div>
									{orientation.value === selectedOrientation ? (
										<CheckIcon className="h-auto w-4" />
									) : null}
								</div>
								<div className="col-span-7">
									<span>{orientation.label}</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex justify-end gap-3 border-t border-gray-200 p-4">
				<Button
					disabled={enableClearButton}
					onClick={clearFilters}
					variant="outlined"
				>
					Clear Filters
				</Button>
				<Button onClick={areThereChanges ? handleApply : onClose}>
					{areThereChanges ? 'Apply' : 'Close'}
				</Button>
			</div>
		</Modal>
	)
}
