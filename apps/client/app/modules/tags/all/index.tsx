import { EmptyState } from '@/components/empty-state/index.tsx'
import {Footer} from '@/components/footer/index.tsx'
import {Header} from '@/components/layout/index.ts'

export function TagsModule() {
  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="mx-auto max-w-8xl py-4 px-4 lg:px-8">
        <div className="mt-10">
          <h1 className="font-black text-4xl">Tags</h1>
          <div className="mt-8">
            <p className="text-sm font-medium w-full md:w-1/3">
              Explore the world through tags of beautiful images to use under
              the mfoni License.
            </p>
          </div>
        </div>

        <div className="flex flex-1 justify-center items-center h-[50vh]">
          <EmptyState
            message="There are no tags found yet. Come back later."
            title="No tags found"
          />
        </div>
      </div>
      <Footer />
    </>
  )
}
