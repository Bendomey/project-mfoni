import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  InformationCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import { ChevronDownIcon, XCircleIcon } from "@heroicons/react/20/solid";
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  HeartIcon as HeartIconOutline,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import dayjs from "dayjs";
import { Fragment, useMemo } from "react";
import { EditTitleModal } from "./components/edit-title-modal/index.tsx";
import { RelatedContent } from "./components/related-content.tsx";
import { Button } from "@/components/button/index.tsx";
import { BuyButtonApi } from "@/components/buy-button/index.tsx";
import {
  type ContentSize,
  DownloadButtonApi,
} from "@/components/download-button.tsx";
import { Footer } from "@/components/footer/index.tsx";
import { Image } from "@/components/Image.tsx";
import { Header } from "@/components/layout/index.ts";
import { LikeButton } from "@/components/like-button.tsx";
import { ShareButton } from "@/components/share-button/index.tsx";
import { UserImage } from "@/components/user-image.tsx";
import { PAGES } from "@/constants/index.ts";
import { useDisclosure } from "@/hooks/use-disclosure.tsx";
import { classNames } from "@/lib/classNames.ts";
import { convertPesewasToCedis, formatAmount } from "@/lib/format-amount.ts";
import { getSizeStringForContent } from "@/lib/image-fns.ts";
import { safeString } from "@/lib/strings.ts";
import { useAuth } from "@/providers/auth/index.tsx";
import { type loader } from "@/routes/photos.$slug.ts";

export const PhotoModule = () => {
  const { currentUser } = useAuth();
  const { content, origin } = useLoaderData<typeof loader>();
  const editTitleModalState = useDisclosure();
  const location = useLocation();

  const isContentMine = content?.createdBy?.id === currentUser?.id;

  const canUserDownload = useMemo(() => {
    if (isContentMine) {
      return true;
    }

    if (content?.amount === 0) {
      return true;
    }

    if (content?.amount && content?.amount > 0 && content?.isPurchased) {
      return true;
    }

    return false;
  }, [content, isContentMine]);

  const size = useMemo(() => {
    if (content?.media.orientation === "LANDSCAPE") {
      return {
        width: 700,
        height: 500,
      };
    }

    if (content?.media.orientation === "PORTRAIT") {
      return {
        width: 500,
        height: 700,
      };
    }

    return {
      width: 400,
      height: 400,
    };
  }, [content]);

  if (!content) return null;

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
        <div>
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Link
                to={PAGES.CREATOR.PHOTOS.replace(
                  ":username",
                  safeString(content.createdBy?.username),
                )}
              >
                <div className="mt-2 flex items-center gap-2">
                  <UserImage
                    name={safeString(content.createdBy?.name)}
                    image={content.createdBy?.photo}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {content.createdBy?.name}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {content.createdBy?.username}
                    </span>
                  </div>
                </div>
              </Link>
              {isContentMine ? (
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                  {content.visibility}
                </span>
              ) : null}
            </div>

            <div className="flex flex-row items-center justify-between gap-2 md:justify-normal">
              <div className="flex gap-2">
                {content.status !== "DONE" ? null : (
                  <LikeButton content={content as unknown as Content}>
                    {({ isDisabled, isLiked, onClick }) => (
                      <Button
                        onClick={onClick}
                        title={isLiked ? "Remove Like" : "Like Image"}
                        variant="outlined"
                        size="sm"
                        disabled={isDisabled}
                      >
                        {isLiked ? (
                          <HeartIconSolid className="mr-1 h-6 w-4 text-blue-700" />
                        ) : (
                          <HeartIconOutline className="mr-1 h-6 w-4 text-zinc-700" />
                        )}
                        Like{isLiked ? "d" : ""}
                      </Button>
                    )}
                  </LikeButton>
                )}
              </div>
              {canUserDownload ? (
                <DownloadButton
                  content={content as unknown as Content}
                  sizes={content.media.sizes}
                />
              ) : (
                <BuyButtonApi content={content as unknown as Content}>
                  {({ onClick }) => (
                    <Button onClick={onClick} color="success">
                      <LockClosedIcon className="mr-1 size-4 text-white" />
                      Buy {formatAmount(convertPesewasToCedis(content.amount))}
                    </Button>
                  )}
                </BuyButtonApi>
              )}
            </div>
          </div>

          {isContentMine ? (
            content.status === "REJECTED" ? (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <XCircleIcon
                      aria-hidden="true"
                      className="size-5 text-red-400"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Image failed processing
                    </h3>
                    <p className="mt-1 text-xs text-red-600">
                      {content.imageProcessingResponse?.message ??
                        "Something happened while processing your image."}
                    </p>
                  </div>
                </div>
              </div>
            ) : content.status === "PROCESSING" ? (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <InformationCircleIcon
                      aria-hidden="true"
                      className="size-5 text-yellow-400"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Image is processing. Come back later.
                    </h3>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}

          <div
            className={classNames(
              "my-10 flex justify-center md:mx-40 lg:mx-64",
            )}
          >
            <Image
              width={size.width}
              height={size.height}
              src={content.media.url}
              alt={content.title}
              className="object-cover w-full h-full"
              loadingColor={content.backgroundColor ?? undefined}
            />
          </div>

          <div className="flex flex-row items-start justify-between md:items-center">
            <div className="grid w-[50vw] grid-cols-1 gap-5 md:w-full md:grid-cols-5">
              <div className="text-sm">
                <h1 className="text-gray-500">Views</h1>
                <p className="font-semibold">{content.meta.views}</p>
              </div>
              <div className="text-sm">
                <h1 className="text-gray-500">Downloads</h1>
                <p className="font-semibold">{content.meta.downloads}</p>
              </div>
              <div className="text-sm">
                <h1 className="text-gray-500">Likes</h1>
                <p className="font-semibold">{content.meta.likes}</p>
              </div>
              {content.isFeatured ? (
                <div className="text-sm">
                  <h1 className="text-gray-500">Is featured</h1>
                  <p className="font-semibold">Yes</p>
                </div>
              ) : null}
            </div>
            <div className="flex flex-row items-center gap-2">
              <ShareButton
                text={`Check out this photo by ${content.createdBy?.name} on mfoni`}
              />
              <Link
                to={`${PAGES.REPORT.CONTENTS}?content_url=${encodeURIComponent(
                  `${origin}${location.pathname}`,
                )}`}
              >
                <Button color="dangerGhost">Report</Button>
              </Link>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-row items-center">
              <h1 className="font-bold">{content.title}</h1>
              {isContentMine ? (
                <Button
                  variant="unstyled"
                  className="ml-4"
                  onClick={editTitleModalState.onToggle}
                >
                  <PencilIcon className="h-4 w-auto" />
                  <EditTitleModal
                    isOpened={editTitleModalState.isOpened}
                    closeModal={editTitleModalState.onClose}
                    title={content.title}
                    contentId={content.id}
                  />
                </Button>
              ) : null}
            </div>

            <div className="flex">
              {content.amount === 0 ? null : (
                <div className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  mfoni+
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="flex flex-row items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  {content.status === "DONE" ? "Published" : "Uploaded"} on{" "}
                  {dayjs(content.createdAt).format("LL")}
                </span>
              </div>

              <div className="mt-2 flex flex-row items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  Free to use under the mfoni License
                </span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              {content.tags?.map((tag, index) => (
                <Link key={index} to={PAGES.TAG.replace(":tag", tag.slug)}>
                  <div className="rounded bg-gray-100 px-3 py-2">
                    <span className="text-sm font-medium text-gray-600">
                      {tag.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {content ? <RelatedContent contentId={content.id} /> : null}
      </div>
      <Footer />
    </>
  );
};

interface Props {
  sizes: ContentMediaSizes;
  content: Content;
}

export default function DownloadButton({ sizes, content }: Props) {
  const items = [
    {
      name: "Small",
      size: getSizeStringForContent(sizes.small),
      isAvailable: Boolean(sizes.small),
    },
    {
      name: "Medium",
      size: getSizeStringForContent(sizes.medium),
      isAvailable: Boolean(sizes.medium),
    },
    {
      name: "Large",
      size: getSizeStringForContent(sizes.large),
      isAvailable: Boolean(sizes.large),
    },
  ];

  return (
    <DownloadButtonApi content={content}>
      {({ isDisabled, onClick }) => (
        <div className="inline-flex rounded-md shadow-sm">
          <button
            disabled={isDisabled}
            onClick={() => onClick("MEDIUM")}
            type="button"
            className={classNames(
              "relative inline-flex items-center rounded-l-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 focus:z-10",
              {
                "cursor-not-allowed bg-green-800/50 hover:bg-green-800/50":
                  isDisabled,
              },
            )}
          >
            Download
          </button>
          <Menu as="div" className="relative -ml-px block">
            <MenuButton
              disabled={isDisabled}
              className={classNames(
                "relative inline-flex items-center rounded-r-md border-l border-gray-200 bg-green-600 px-2 py-2 text-white hover:bg-green-800 focus:z-10",
                {
                  "cursor-not-allowed bg-green-800/50 hover:bg-green-800/50":
                    isDisabled,
                },
              )}
            >
              <span className="sr-only">Open options</span>
              <ChevronDownIcon aria-hidden="true" className="size-5" />
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                {items.map((item) => (
                  <Fragment key={item.name}>
                    {item.isAvailable ? (
                      <MenuItem>
                        <button
                          onClick={() => {
                            onClick(item.name.toUpperCase() as ContentSize);
                          }}
                          disabled={isDisabled}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                        >
                          {item.name}{" "}
                          <span className="ml-1 text-xs text-gray-400">
                            ({item.size})
                          </span>
                        </button>
                      </MenuItem>
                    ) : null}
                  </Fragment>
                ))}

                <MenuItem>
                  <button
                    disabled={isDisabled}
                    onClick={() => onClick("ORIGINAL")}
                    type="button"
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    Original{" "}
                    <span className="ml-1 text-xs text-gray-400">
                      ({getSizeStringForContent(sizes.original)})
                    </span>
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      )}
    </DownloadButtonApi>
  );
}
