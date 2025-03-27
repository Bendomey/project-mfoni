import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useParams } from "@remix-run/react";
import { useGetCollections } from "@/api/collections/index.ts";
import { FadeIn, FadeInStagger } from "@/components/animation/FadeIn.tsx";
import { Button } from "@/components/button/index.tsx";
import { CollectionCard } from "@/components/CollectionCard/index.tsx";
import { EmptyState } from "@/components/empty-state/index.tsx";
import { ErrorState } from "@/components/error-state/index.tsx";
import { NoSearchResultLottie } from "@/components/lotties/no-search-results.tsx";
import { PAGES } from "@/constants/index.ts";
import { safeString } from "@/lib/strings.ts";

export function SearchCollectionsModule() {
  const { query: queryParam } = useParams();
  const searchQuery = safeString(queryParam);

  const { data, isPending, isError } = useGetCollections({
    pagination: { page: 0, per: 50 },
    filters: { visibility: "PUBLIC" },
    populate: ["collection.createdBy", "content"],
    search: {
      query: searchQuery,
    },
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
      <div className="flex h-[60vh] flex-1 items-center justify-center">
        <ErrorState
          message="An error occurred searching collections."
          title="Something happened."
        >
          <Button
            isLink
            variant="outlined"
            href={PAGES.SEARCH.COLLECTIONS.replace(":query", searchQuery)}
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
      <div className="flex h-[60vh] flex-1 items-center justify-center">
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
    );
  }

  if (data?.total) {
    content = (
      <FadeInStagger faster>
        <div className="mt-8 grid min-h-[60vh] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.rows.map((collection) => (
            <FadeIn key={collection.id}>
              <CollectionCard collection={collection} />
            </FadeIn>
          ))}
        </div>
      </FadeInStagger>
    );
  }

  return <>{content}</>;
}
