import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";
import { type Content } from "../context.tsx";
import { SubmitModal } from "./submit-modal.tsx";
import { Button } from "@/components/button/index.tsx";
import { useDisclosure } from "@/hooks/use-disclosure.tsx";

const CircularProgress = ({ progress }: { progress: number }) => {
  const circumference = ((2 * 22) / 7) * 15;
  return (
    <div className="flex items-center justify-center">
      <svg className="h-10 w-10 -rotate-90 transform">
        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          className="text-zinc-200"
        />

        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          className="text-emerald-700"
        />
      </svg>
    </div>
  );
};

export const Footer = ({ contents }: { contents: Array<Content> }) => {
  const { isOpened: isOpenSubmitModal, onToggle: onToggleSubmitModal } =
    useDisclosure();
  const rejectedContentLength = useMemo(
    () => contents.filter((content) => content.status === "rejected").length,
    [contents],
  );

  const contentLength = useMemo(() => contents.length, [contents]);
  const acceptedContentsLength = useMemo(
    () => contentLength - rejectedContentLength,
    [contentLength, rejectedContentLength],
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 z-10 flex w-full justify-center border-t border-gray-200 bg-blue-50">
        <div className="mx-6 grid w-full grid-cols-3 gap-4 py-5 md:mx-12 md:py-10">
          <div>
            <div className="flex flex-row gap-3">
              <div className="flex flex-row items-center gap-2">
                <CircularProgress
                  progress={Math.ceil(
                    (acceptedContentsLength / contentLength) * 100,
                  )}
                />
                <div className="block font-bold text-emerald-800 md:hidden">
                  {acceptedContentsLength} / {contentLength}
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-emerald-700">
                  Content uploaded
                </h1>
                <h1 className="mt-1 font-semibold text-emerald-500">
                  {acceptedContentsLength} of {contentLength} photos are
                  uploaded
                </h1>
              </div>
            </div>
          </div>
          <div>
            {rejectedContentLength > 0 ? (
              <div className="flex flex-row gap-3">
                <div className="flex flex-row items-center gap-2">
                  <ExclamationCircleIcon className="h-9 w-auto text-red-600" />
                  <div className="block font-bold text-red-600 md:hidden">
                    {rejectedContentLength} / {contentLength}
                  </div>
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-red-600">
                    Content failed
                  </h1>
                  <h1 className="mt-1 font-semibold text-red-400">
                    {rejectedContentLength} of {contentLength} photos failed to
                    upload
                  </h1>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onToggleSubmitModal}
              size="xl"
              className="flex flex-row items-center"
            >
              Submit{" "}
              <span className="ml-1.5 hidden md:block">your content</span>
            </Button>
          </div>
        </div>
      </div>

      <SubmitModal isOpen={isOpenSubmitModal} onToggle={onToggleSubmitModal} />
    </>
  );
};
