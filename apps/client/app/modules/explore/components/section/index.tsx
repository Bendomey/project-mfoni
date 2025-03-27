import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { CollectionSection, CollectionShimmer } from "./collection-section.tsx";
import { ContentSection, ContentShimmer } from "./content-section.tsx";
import { CreatorSection, CreatorShimmer } from "./creator-section.tsx";
import { TagSection, TagShimmer } from "./tag-section.tsx";
import { QUERY_KEYS } from "@/constants/index.ts";
import { fetchClient } from "@/lib/transport/index.ts";

interface Props {
  section: ExploreSection;
}

const loadingSections = {
  TAG: TagShimmer,
  CONTENT: ContentShimmer,
  COLLECTION: CollectionShimmer,
  CREATOR: CreatorShimmer,
};

export function ExploreSection({ section }: Props) {
  const { isLoading, data, isError } = useQuery({
    queryKey: [QUERY_KEYS.EXPLORE, section.id],
    queryFn: async () => {
      const response = await fetchClient<
        ApiResponse<FetchMultipleDataResponse<unknown>>
      >(section.endpoint);
      return response?.parsedBody?.data;
    },
  });

  let content: Array<JSX.Element | null> = [];

  if (isLoading) {
    content = [...new Array(7)].map((_, index) => {
      const Section = loadingSections[section.type];
      return <Section key={index} />;
    });
  }

  if (isError || (data && !data?.total)) return null;

  if (data?.total) {
    content = data?.rows.map((content, index) => {
      switch (section.type) {
        case "TAG":
          const tag = (content as CollectionContent).tag;
          if (tag) {
            return <TagSection key={index} data={tag} />;
          }
          return null;
        case "CONTENT":
          const contentData = (content as CollectionContent).content;
          if (contentData) {
            return <ContentSection key={index} data={contentData} />;
          }

          return null;
        case "COLLECTION":
          const childCollectionId = (content as CollectionContent)
            .childCollectionId;
          if (childCollectionId) {
            return (
              <CollectionSection key={index} collectionId={childCollectionId} />
            );
          }
          return null;
        case "CREATOR":
          const isGettingDataFromCollectionsEndpoint =
            section.endpoint.includes("collections");
          if (isGettingDataFromCollectionsEndpoint) {
            const creator = (content as CollectionContent).creator;
            if (creator) {
              return <CreatorSection key={index} data={creator} />;
            }
          }

          const isGettingDataFromFollowings =
            section.endpoint.includes("followings");
          if (isGettingDataFromFollowings && content) {
            return (
              <CreatorSection key={index} data={content as EnhancedCreator} />
            );
          }

          return null;
        default:
          return null;
      }
    });
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between gap-x-2">
        <h2 className="flex items-center text-xl font-bold">{section.title}</h2>
        {section?.seeMorePathname ? (
          <Link
            prefetch="intent"
            to={section.seeMorePathname}
            className="flex items-center gap-x-1 text-xs font-medium text-blue-600 hover:underline"
          >
            See More <ChevronRightIcon className="h-3 w-auto" />
          </Link>
        ) : null}
      </div>

      <div className="no-scrollbar mt-3 flex w-full items-center gap-8 overflow-x-auto">
        {content}
      </div>
    </div>
  );
}
