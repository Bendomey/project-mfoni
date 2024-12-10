import { useGetCollectionContentsBySlug } from "@/api/collections/index.ts";
import { FadeIn } from "@/components/animation/FadeIn.tsx";
import { Button } from "@/components/button/index.tsx";
import { Content } from "@/components/Content/index.tsx";
import { EmptyState } from "@/components/empty-state/index.tsx";
import { ErrorState } from "@/components/error-state/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { PAGES } from "@/constants/index.ts";
import { safeString } from "@/lib/strings.ts";
import { useAuth } from "@/providers/auth/index.tsx";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

export function AccountContentsModule() {
    const { currentUser } = useAuth()
    const { data, isError, isPending } = useGetCollectionContentsBySlug({
        slug: `${safeString(currentUser?.id)}_uploads`,
        query: {
            pagination: { page: 0, per: 50 },
            populate: ['content', 'tag'],
        },
    })

    if (isPending) {
        return (
            <div className="my-16 flex justify-center">
                <Loader />
            </div>
        )
    }

    if (isError) {
        return (
            <ErrorState
                message="There are no contents found yet. You could start uploading now."
                title="No content found"
            >
                <Button
                    isLink
                    variant='outlined'
                    href={PAGES.AUTHENTICATED_PAGES.ACCOUNT}
                    linkProps={{
                        reloadDocument: true,
                    }}
                >
                    <ArrowPathIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
                    Reload
                </Button>
            </ErrorState>
        )
    }

    if (!data?.total) {
        return (
            <EmptyState
                message="There are no contents found yet. You could start uploading now."
                title="No content found"
            >
                <Button
                    isLink
                    href={PAGES.AUTHENTICATED_PAGES.UPLOAD}
                >
                    <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />
                    Upload new content
                </Button>
            </EmptyState>
        )
    }


    return (
        <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8 ">
            {data.rows.map((collectionContent, index) => (
                <Fragment key={index}>
                    {
                        collectionContent.content ? (
                            <FadeIn>
                                <Content content={collectionContent.content} showCreator={false} />
                            </FadeIn>
                        ) : null
                    }
                </Fragment>
            ))}
        </div>
    )
}