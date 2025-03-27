import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";
import { ACCEPTED_MAX_FILES, useContentUpload } from "../context.tsx";
import { Button } from "@/components/button/index.tsx";

export const ContentUploader = () => {
  const { openFileSelector, maxFiles, contents } = useContentUpload();
  return (
    <>
      <div className="flex justify-center">
        <h1 className="w-3/3 mt-5 px-3 text-center text-xl font-bold md:w-2/3 md:px-0 md:text-4xl">
          Share your photo masterpieces and captivate the world with your
          creativity!
        </h1>
      </div>
      <div className="max-w-8xl flex flex-col px-4 lg:px-8">
        <div className="mt-10 w-full rounded-3xl border-4 border-dashed border-zinc-100 py-10">
          <div className="flex flex-col items-center justify-center">
            <ArrowUpTrayIcon
              className="h-14 w-auto text-blue-700"
              strokeWidth={2}
            />
            <h1 className="w-3/3 mt-5 text-center text-xl font-bold md:w-72 md:text-4xl">
              Drag and drop to upload, or
            </h1>
            <Button
              onClick={openFileSelector}
              disabled={maxFiles === 0}
              size="lg"
              className="mt-7"
            >
              Browse
            </Button>
            <div className="mt-5">
              <p className="font-bold text-zinc-400 md:text-lg">
                {maxFiles < ACCEPTED_MAX_FILES &&
                Object.keys(contents).length === 0 ? (
                  <>
                    (You have{" "}
                    <span className="text-blue-600">{maxFiles} uploads</span>{" "}
                    left)
                  </>
                ) : (
                  <>
                    (You can upload{" "}
                    <span className="text-blue-600">{maxFiles} photos</span> at
                    a time)
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="mx-4 mt-20 grid grid-cols-1 gap-4 md:mx-5 md:mt-28 md:grid-cols-3 xl:mx-16">
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="h-5 w-auto text-blue-600" />
              <b>Original</b> content you captured
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="h-5 w-auto text-blue-600" />
              Mindful of the rights of others
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="h-5 w-auto text-blue-600" />
              <b>High quality</b> photos
            </div>
            <div className="flex flex-row flex-wrap gap-1 font-medium">
              <CheckBadgeIcon className="h-5 w-auto text-blue-600" />
              <b>Zero tolerance</b> for nudity, violence or hate
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="h-5 w-auto text-blue-600" />
              To be <b>paid</b> or downloaded for <b>free</b>
            </div>
            <div className="flex flex-row items-center gap-1 font-medium">
              <CheckBadgeIcon className="h-5 w-auto text-blue-600" />
              Read the{" "}
              <Link
                prefetch="intent"
                to="/terms"
                target="_blank"
                className="border-b border-dashed border-zinc-600"
              >
                mfoni Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
