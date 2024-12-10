import {Button} from '@/components/button/index.tsx'
import { EmptyState } from '@/components/empty-state/index.tsx'
import {Footer} from '@/components/footer/index.tsx'
import {Header} from '@/components/layout/index.ts'
import {ShareButton} from '@/components/share-button/index.tsx'
import {PAGES} from '@/constants/index.ts'
import {ChevronLeftIcon} from '@heroicons/react/24/outline'
import {useParams} from '@remix-run/react'

export function CollectionModule() {
  const {collection: collectionParam} = useParams()
  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="mx-auto max-w-8xl py-4 px-4 lg:px-8">
        <div className="mt-10">
          <Button
            isLink
            href={PAGES.TAGS}
            variant="unstyled"
            className="mb-1 hover:underline"
          >
            <ChevronLeftIcon className="h-4 w-auto" />
            Collections
          </Button>
          <h1 className="font-black text-4xl">{collectionParam}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-600">
              <span className="text-xs font-medium text-white">MF</span>
            </span>
            <span className="font-medium text-gray-500">Curated by mfoni</span>
          </div>
          <div className="mt-5 flex flex-col md:flex-row justify-between gap-5">
            <div>
              <p className="text-sm font-medium w-full md:w-2/3">
                Browse through the carefully curated contents around "
                {collectionParam}" — you could also submit your best work.
              </p>
            </div>
            <div className="flex flex-row items-center justify-end gap-2">
              <ShareButton />
              <Button color="dangerGhost">Report</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-center items-center h-[50vh]">
          <EmptyState
            message={`There are no content found under "${collectionParam}". Come back later.`}
            title="No content found"
          />
        </div>
      </div>
      <Footer />
    </>
  )
}
