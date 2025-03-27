import { Dialog } from "@headlessui/react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone-esm";
import { Image } from "remix-image";
import { Loader } from "../loader/index.tsx";
import { Button } from "@/components/button/index.tsx";
import { Modal } from "@/components/modal/index.tsx";
import useImageUpload from "@/hooks/use-image-upload.ts";
import { classNames } from "@/lib/classNames.ts";
import { errorToast } from "@/lib/custom-toast-functions.tsx";
import { megabytesToBytes } from "@/lib/image-fns.ts";
import { type IImageType } from "@/modules/account/home/components/creator-application-modal/index.tsx";

interface Props {
  onClose: () => void;
  isOpened: boolean;
  onSave: (image: IImageType) => void;
}

const MAX_SIZE = 5;

export const UploadDialog = ({ isOpened, onClose, onSave }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const { upload, isLoading, results: uploadResults } = useImageUpload();

  const imageUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile],
  );

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      errorToast(
        fileRejections[0]?.errors[0]?.message ??
          "Something happened, try again later.",
      );
      return;
    }

    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
      void upload(acceptedFiles[0]);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileSelector,
  } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      "image/png": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    maxSize: megabytesToBytes(MAX_SIZE),
  });

  return (
    <Modal
      className="w-full md:w-4/6 lg:w-2/6"
      onClose={onClose}
      isOpened={isOpened}
      canBeClosedWithBackdrop={false}
    >
      <Dialog.Title
        as="h3"
        className="text-center text-lg font-medium leading-6 text-gray-900"
      >
        Upload
      </Dialog.Title>
      <div className="my-5">
        {imageUrl ? (
          <div className="relative flex h-60 w-full items-center justify-center">
            <Image
              src={imageUrl}
              alt={selectedFile?.name}
              className="h-60 w-auto rounded-md"
            />
            {isLoading ? (
              <div className="absolute z-10 flex h-full w-full items-center justify-center rounded-md bg-black/50">
                <Loader size="10" color="fill-white" />
              </div>
            ) : uploadResults ? (
              <div className="absolute z-10 flex h-full w-full items-end justify-center rounded-md p-2">
                <Button
                  onClick={() => {
                    setSelectedFile(undefined);
                  }}
                  variant="unstyled"
                  color="dangerGhost"
                  className="h-14 w-14 rounded-full bg-red-600/90 text-white shadow-lg ring-1 ring-white hover:bg-red-100 hover:text-red-600"
                >
                  <XMarkIcon className="h-7 w-auto" />
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="col-span-full">
            <div
              {...getRootProps()}
              className={classNames(
                "mt-2 flex justify-center rounded-md border border-dashed border-gray-900/25 px-6 py-10",
                isDragActive ? "bg-gray-50" : "",
              )}
            >
              <div className="text-center">
                <PhotoIcon
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-gray-300"
                />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <button
                    onClick={openFileSelector}
                    className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input {...getInputProps()} />
                  </button>
                  <p className="pl-1">or drag and drop</p>
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-row items-center justify-between">
              <span className="text-[10px] text-gray-500">
                Supported Formats: PNG, JPG
              </span>
              <span className="text-[10px] text-gray-500">
                Maximum Size: {MAX_SIZE}MB
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={() => {
            if (uploadResults && selectedFile) {
              onSave({
                name: selectedFile.name,
                url: uploadResults.fileLink,
              });
            }
          }}
          variant="solid"
          color="success"
          type="submit"
          disabled={!uploadResults || !selectedFile || isLoading}
        >
          Continue
        </Button>
        <Button
          variant="outlined"
          type="button"
          className="ml-2"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};
