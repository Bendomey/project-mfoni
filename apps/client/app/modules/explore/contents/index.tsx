import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "@remix-run/react";
import { useMemo } from "react";
import { FilterBar } from "./components/filter-bar.tsx";
import { useGetContents } from "@/api/contents/index.ts";
import { FadeIn, FadeInStagger } from "@/components/animation/FadeIn.tsx";
import { Button } from "@/components/button/index.tsx";
import { Content } from "@/components/Content/index.tsx";
import { EmptyState } from "@/components/empty-state/index.tsx";
import { ErrorState } from "@/components/error-state/index.tsx";
import { Footer } from "@/components/footer/index.tsx";
import { Header } from "@/components/layout/index.ts";

export const ContentsModule = () => {
  const [searchParams] = useSearchParams();

  const validateLicense = useMemo(() => {
    const base = searchParams.get("license") ?? "ALL";

    if (["ALL", "FREE", "PREMIUM"].includes(base)) {
      return base;
    }

    return "ALL";
  }, [searchParams]);

  const validateOrientation = useMemo(() => {
    const base = searchParams.get("orientation") ?? "ALL";

    if (["ALL", "LANDSCAPE", "PORTRAIT", "SQUARE"].includes(base)) {
      return base;
    }

    return "ALL";
  }, [searchParams]);

  const { data, isPending, isError, refetch } = useGetContents({
    query: {
      pagination: { page: 0, per: 50 },
      filters: {
        license: validateLicense,
        orientation: validateOrientation,
      },
      populate: ["content.createdBy"],
    },
  });

  let content = <></>;

  if (isPending) {
    content = (
      <div className="columns-1 gap-8 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4">
        <div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-96 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-56 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
        <div className="mb-5 h-60 w-full animate-pulse break-inside-avoid rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (isError) {
    content = (
      <div className="flex h-[50vh] flex-1 items-center justify-center">
        <ErrorState
          message="An error occurred fetching contents."
          title="Something happened."
        >
          <Button isLink onClick={() => refetch()} variant="outlined">
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
          message={`There are no contents found`}
          title="No content found"
        />
      </div>
    );
  }

  if (data?.total) {
    content = (
      <FadeInStagger faster>
        <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8">
          {data.rows.map((content) => (
            <div className="mb-5" key={content.id}>
              <FadeIn>
                <Content content={content} />
              </FadeIn>
            </div>
          ))}
        </div>
      </FadeInStagger>
    );
  }

  return (
    <div>
      <Header isHeroSearchInVisible={false} />
      <div className="max-w-8xl mx-auto my-10 items-center px-3 sm:px-3 md:px-8">
        <FilterBar />
        {content}
      </div>
      <Footer />
    </div>
  );
};
