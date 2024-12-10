import { EmptyState } from '@/components/empty-state/index.tsx'
import {NoSearchResultLottie} from '@/components/lotties/no-search-results.tsx'
import {useParams} from '@remix-run/react'

export function SearchCollectionsModule() {
  const {query: queryParam} = useParams()
  return (
    <div className="flex flex-1 justify-center items-center h-[50vh]">
      <EmptyState
        message={`There are no collections found under "${queryParam}". Adjust your search query.`}
        title="Search results is empty"
        svg={
          <div className="mb-5">
            <NoSearchResultLottie />
          </div>
        }
      />
    </div>
  )
}
