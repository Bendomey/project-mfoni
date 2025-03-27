import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useGetCollections } from "@/api/collections/index.ts";
import { Button } from "@/components/button/index.tsx";
import { CollectionCard } from "@/components/CollectionCard/index.tsx";
import { EmptyState } from "@/components/empty-state/index.tsx";
import { ErrorState } from "@/components/error-state/index.tsx";
import { PAGES } from "@/constants/index.ts";
import { useAuth } from "@/providers/auth/index.tsx";

export function AccountCollectionsModule() {
  const { currentUser } = useAuth();
  const { data, isError, isPending } = useGetCollections({
    pagination: { page: 0, per: 50 },
    filters: {
      created_by: currentUser?.id,
      visibility: "ALL",
    },
    populate: ["content"],
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
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
    return (
      <div className="my-20">
        <ErrorState
          message="An error occurred fetching your collections."
          title="Something happened."
        >
          <Button
            isLink
            variant="outlined"
            href={PAGES.AUTHENTICATED_PAGES.ACCOUNT}
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

  if (!data?.total) {
    return (
      <div className="my-20">
        <EmptyState
          message="There are no collections found yet. You could create one now."
          title="No collections found"
        >
          <Button isLink href={PAGES.AUTHENTICATED_PAGES.UPLOAD}>
            <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
            Create Collection
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
      {data.rows.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
