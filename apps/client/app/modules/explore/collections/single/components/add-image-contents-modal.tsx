import { CheckCircleIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Image } from "remix-image";
import {
  useAddContentsToCollection,
  useGetCollectionContentsBySlug,
} from "@/api/collections/index.ts";
import { FadeIn, FadeInStagger } from "@/components/animation/FadeIn.tsx";
import { Button } from "@/components/button/index.tsx";
import { EmptyState } from "@/components/empty-state/index.tsx";
import { ErrorState } from "@/components/error-state/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { Modal } from "@/components/modal/index.tsx";
import { blurDataURL, PAGES, QUERY_KEYS } from "@/constants/index.ts";
import { classNames } from "@/lib/classNames.ts";
import { errorToast } from "@/lib/custom-toast-functions.tsx";
import { safeString } from "@/lib/strings.ts";
import { useAuth } from "@/providers/auth/index.tsx";

interface Props {
  collection: Collection;
  isOpened: boolean;
  onClose: () => void;
  existingContents: Array<CollectionContent>;
}

const MAX_CONTENTS = 50;

export function AddImageContentsModal({
  existingContents,
  collection,
  isOpened,
  onClose,
}: Props) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data, isError, isPending, refetch } = useGetCollectionContentsBySlug({
    slug: `${safeString(currentUser?.id)}_uploads`,
    query: {
      pagination: { page: 0, per: 50 },
      populate: ["content", "content.tags"],
    },
  });
  const { mutate, isPending: isSubmitting } = useAddContentsToCollection();
  const [selectedContents, setSelectedContents] = useState<Array<string>>([]);

  const totalContentsAdded = useMemo(
    () => existingContents.length + selectedContents.length,
    [existingContents, selectedContents],
  );

  const handleAddingContent = (id: string) => {
    if (selectedContents.includes(id)) {
      setSelectedContents(
        selectedContents.filter((contentId) => contentId !== id),
      );
    } else {
      setSelectedContents([...selectedContents, id]);
    }
  };

  const isSelected = useCallback(
    (id: string) => Boolean(selectedContents.includes(id)),
    [selectedContents],
  );

  const isAlreadySelected = useCallback(
    (id: string) =>
      existingContents.some((content) => content.content?.id === id),
    [existingContents],
  );

  const isAddDisabled = useMemo(
    () => selectedContents.length === 0 || isSubmitting,
    [isSubmitting, selectedContents.length],
  );

  const handleSubmit = () => {
    mutate(
      {
        collectionId: collection.id,
        contentIds: selectedContents.map((id) => ({ type: "CONTENT", id })),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              QUERY_KEYS.COLLECTIONS,
              collection.slug,
              "slug-contents",
            ],
          });
          onClose();
        },
        onError: () => {
          errorToast("Adding contents failed. Try again later.");
        },
      },
    );
  };

  let contentJsx = <></>;

  if (isPending) {
    contentJsx = (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  } else if (isError) {
    contentJsx = (
      <div className="flex h-full flex-1 items-center justify-center">
        <ErrorState
          message="An error occurred fetching your contents."
          title="Something happened."
        >
          <Button variant="outlined" onClick={() => refetch()}>
            <ArrowPathIcon
              aria-hidden="true"
              className="-ml-0.5 mr-1.5 size-5"
            />
            Reload
          </Button>
        </ErrorState>
      </div>
    );
  } else if (data && !data?.total) {
    contentJsx = (
      <div className="flex h-full flex-1 items-center justify-center">
        <EmptyState
          message="There are no contents found yet. You could start uploading now."
          title="No content found"
        >
          <Button isLink href={PAGES.AUTHENTICATED_PAGES.UPLOAD}>
            <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
            Upload new content
          </Button>
        </EmptyState>
      </div>
    );
  } else if (data?.total) {
    contentJsx = (
      <FadeInStagger faster>
        <div className="columns-2 gap-2 sm:columns-4">
          {data.rows.map((colletionContent) =>
            colletionContent.content ? (
              <div
                className="mb-3 break-inside-avoid"
                key={colletionContent.id}
              >
                <FadeIn>
                  <Content
                    isDisabled={totalContentsAdded >= MAX_CONTENTS}
                    isSelected={isSelected(colletionContent.content.id)}
                    isAlreadySelected={isAlreadySelected(
                      colletionContent.content.id,
                    )}
                    content={colletionContent.content}
                    onClick={() =>
                      handleAddingContent(
                        safeString(colletionContent?.content?.id),
                      )
                    }
                  />
                  {colletionContent.content.visibility === "PRIVATE" ? (
                    <div className="mt-1 flex">
                      <div className="rounded bg-zinc-100 px-2 py-1 text-xs">
                        Hidden
                      </div>
                    </div>
                  ) : null}
                </FadeIn>
              </div>
            ) : null,
          )}
        </div>
      </FadeInStagger>
    );
  }

  return (
    <Modal
      className="w-full md:w-4/6 lg:w-3/6"
      isOpened={isOpened}
      onClose={onClose}
      canBeClosedWithBackdrop={false}
    >
      <div>
        <div className="mt-2 grid grid-cols-1">
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Search for contents"
            className="col-start-1 row-start-1 block w-full rounded-md bg-white py-3 pl-10 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-blue-600 sm:pl-9 sm:text-sm/6"
          />
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>{selectedContents.length} Selected</span>
            <span>
              {totalContentsAdded}/{MAX_CONTENTS} contents in collection
            </span>
          </div>
          <div className="h-7">
            {selectedContents.length > 0 ? (
              <button
                onClick={() => setSelectedContents([])}
                className="rounded px-2 py-1 text-sm font-bold hover:bg-zinc-100"
              >
                Clear All
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-2 h-[60vh] overflow-y-auto pr-5">{contentJsx}</div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="solid" color="secondaryGhost" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="solid" disabled={isAddDisabled} onClick={handleSubmit}>
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
      </div>
    </Modal>
  );
}

interface ContentProps {
  content: Content;
  isAlreadySelected?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

function Content({
  content,
  isAlreadySelected = false,
  isSelected = false,
  onClick,
  isDisabled: isDisabledProp = false,
}: ContentProps) {
  const isDisabled = isAlreadySelected || isDisabledProp;

  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      className={classNames(
        "relative cursor-pointer overflow-hidden rounded-lg",
        {
          "cursor-not-allowed opacity-35": isAlreadySelected || isDisabled,
        },
      )}
    >
      <Image
        src={content.media.url}
        className="h-auto max-w-full"
        blurDataURL={blurDataURL}
        alt={content.title}
      />
      <div
        className={classNames(
          "absolute top-0 h-full w-full p-2 hover:bg-black/50",
          {
            "bg-black/50": isSelected || isAlreadySelected,
          },
        )}
      >
        {isAlreadySelected || isSelected ? (
          <div className="flex h-full items-center justify-center">
            <CheckCircleIcon className="size-14 text-white" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
