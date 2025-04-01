import { useSearchParams } from '@remix-run/react'
import { Button } from '../button/index.tsx'

interface Props {
	data: FetchMultipleDataResponse<unknown>
}

export function Pagination({ data }: Props) {
	const [searchParams, setSearchParams] = useSearchParams()
	const start = data.page * data.pageSize + 1
	const end = data.page * data.pageSize + data.pageSize

	const handleNext = () => {
		const nextPage = data.page + 1
		searchParams.set('page', nextPage.toString())
		setSearchParams(searchParams, {
			preventScrollReset: true,
		})
	}
	const handlePrev = () => {
		const prevPage = data.page - 1
		searchParams.set('page', prevPage.toString())
		setSearchParams(searchParams)
	}

	return (
		<nav
			aria-label="Pagination"
			className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
		>
			<div className="hidden sm:block">
				<p className="text-sm text-gray-700">
					Showing <span className="font-medium">{start}</span> to{' '}
					<span className="font-medium">
						{data.total < end ? data.total : end}
					</span>{' '}
					of <span className="font-medium">{data.total}</span> results
				</p>
			</div>
			<div className="flex flex-1 justify-between gap-2 sm:justify-end">
				<Button
					variant="outlined"
					disabled={data.prevPage === null}
					onClick={handlePrev}
				>
					Previous
				</Button>
				<Button
					variant="outlined"
					disabled={!Boolean(data.nextPage)}
					onClick={handleNext}
				>
					Next
				</Button>
			</div>
		</nav>
	)
}
