import {Button} from '../button/index.tsx'

interface Props {
  data: FetchMultipleDataResponse<unknown>
}

export function Pagination({data}: Props) {
  const start = data.page * data.pageSize + 1
  const end = data.page * data.pageSize + data.pageSize

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
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <Button variant="outlined" disabled={!Boolean(data.prevPage)}>
          Previous
        </Button>
        <Button variant="outlined" disabled={!Boolean(data.nextPage)}>
          Next
        </Button>
      </div>
    </nav>
  )
}
