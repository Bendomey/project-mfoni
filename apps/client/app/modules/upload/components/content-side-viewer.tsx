import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";
import { type Content } from "../context.tsx";
// import { FlyoutContainer } from "@/components/flyout/flyout-container.tsx"

export const ContentSideViewer = ({
  content,
  activeContent,
  onSelect,
}: {
  content: Content;
  activeContent: boolean;
  onSelect: VoidFunction;
}) => {
  const imageUrl = useMemo(
    () => URL.createObjectURL(content.file),
    [content.file],
  );
  const isRejected = useMemo(
    () => content.status === "rejected",
    [content.status],
  );

  const isUploading = useMemo(
    () => content.uploadStatus === "uploading",
    [content.uploadStatus],
  );

  // TODO: add error flyout in the future.
  // const ErrorTag = () => {
  //     return (
  //         <div className="bg-red-600 z-10 p-5 w-[45vw] rounded-xl">
  //             <h1 className="text-white font-bold">{content.message}</h1>
  //         </div>
  //     )
  // }

  return (
    // <FlyoutContainer intendedPosition="x" FlyoutContent={undefined} arrowColor="bg-red-600">
    <div
      onClick={onSelect}
      aria-hidden="true"
      className={`relative flex h-[12vh] w-[23vw] cursor-pointer items-center justify-center rounded-lg bg-zinc-100 ring-offset-2 md:w-[7vw] ${
        isRejected ? "ring-red-600" : "ring-blue-400"
      } ${activeContent ? "ring" : "ring-0"}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isUploading ? (
        <div className="absolute top-0 h-full w-full animate-pulse rounded-lg bg-black bg-opacity-50" />
      ) : null}
      {isRejected ? (
        <div className="absolute top-0 h-full w-full rounded-lg bg-red-600 bg-opacity-90">
          <div className="flex h-full w-full items-center justify-center">
            <ExclamationTriangleIcon className="h-10 w-auto text-white" />
          </div>
        </div>
      ) : null}
    </div>
    // </FlyoutContainer>
  );
};
