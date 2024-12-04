import {NoSearchResultLottie} from '@/components/lotties/no-search-results.tsx'
import {EmptyState} from '@/modules/explore/components/empty-state/index.tsx'
import {useParams} from '@remix-run/react'

export function SearchCreatorsModule() {
  const {query: queryParam} = useParams()
  return (
    <>
      <div className="flex flex-1 justify-center items-center h-[50vh]">
        <EmptyState
          message={`There are no creators found under "${queryParam}". Adjust your search query.`}
          title="Search results is empty"
          svg={
            <div className="mb-5">
              <NoSearchResultLottie />
            </div>
          }
        />
      </div>
    </>
  )
}
