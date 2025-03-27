import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useGetCollections } from "@/api/collections/index.ts";
import { FadeIn } from "@/components/animation/FadeIn.tsx";
import { Button } from "@/components/button/index.tsx";
import { CollectionCard } from "@/components/CollectionCard/index.tsx";
import { EmptyState } from "@/components/empty-state/index.tsx";
import { ErrorState } from "@/components/error-state/index.tsx";
import { Footer } from "@/components/footer/index.tsx";
import { Header } from "@/components/layout/index.ts";
import { PAGES } from "@/constants/index.ts";

export function CollectionsModule() {
  const { data, isPending, isError } = useGetCollections({
    pagination: { page: 0, per: 50 },
    filters: { visibility: "PUBLIC" },
    populate: ["collection.createdBy", "content"],
  });

  let content = <></>;

  if (isPending) {
    content = (
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...new Array(12)].map((_, index) => (
          <div key={index} className="animate-pulse space-y-2">
            <div className="h-60 w-full rounded-md bg-zinc-100" />
            <div className="h-3 w-2/3 rounded bg-zinc-100" />
            <div className="h-2 w-1/2 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    content = (
      <div className="flex h-[50vh] flex-1 items-center justify-center">
        <ErrorState
          message="An error occurred fetching your contents."
          title="Something happened."
        >
          <Button
            isLink
            variant="outlined"
            href={PAGES.COLLECTIONS}
            linkProps={{
              reloadDocument: true,
            }}
          >
            <ArrowPathIcon
              aria-hidden="true"
              className="-ml-0.5 mr-1.5 size-5"
            />
            Reload
          </Button>
        </ErrorState>
      </div>
    );
  }

  if (data && !data?.total) {
    content = (
      <div className="flex h-[50vh] flex-1 items-center justify-center">
        <EmptyState
          message="There are no collections found yet. Come back later."
          title="No collections found"
        />
      </div>
    );
  }

  if (data?.total) {
    content = (
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.rows.map((collection) => (
          <FadeIn key={collection.id}>
            <CollectionCard collection={collection} />
          </FadeIn>
        ))}
      </div>
    );
  }

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
        <div className="mt-10">
          <h1 className="text-4xl font-black">Collections</h1>
          <div className="mt-8">
            <p className="w-full text-sm font-medium md:w-1/3">
              Explore the world through collections of beautiful images to use
              under the mfoni License.
            </p>
          </div>
        </div>

        {content}
      </div>
      <Footer />
    </>
  );
}
