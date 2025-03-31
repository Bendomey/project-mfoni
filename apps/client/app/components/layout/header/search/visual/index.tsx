import { VideoCameraSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "@remix-run/react";
import { Fragment, useCallback, useRef, useState } from "react";
import Webcam, { type WebcamProps } from "react-webcam";
import { Button } from "@/components/button/index.tsx";
import { Image } from "@/components/Image.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { useGetPermissionState } from "@/hooks/use-get-permission-state.ts";
import useImageUpload from "@/hooks/use-image-upload.ts";
import { classNames } from "@/lib/classNames.ts";
import { errorToast } from "@/lib/custom-toast-functions.tsx";
import { dataURLtoFile } from "@/lib/data-url-to-file.ts";

interface Props {
  onClose: VoidFunction;
  className?: string;
}

export const VisualSearch = ({ onClose: handleClose, className }: Props) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const webcamRef = useRef<WebcamProps | any>(null);
  const cameraPermissionState = useGetPermissionState(
    "camera" as PermissionName,
  );
  const { upload } = useImageUpload();
  const navigate = useNavigate();

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const handleRetake = useCallback(() => setImgSrc(null), [setImgSrc]);

  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch {
      errorToast("Camera access was  denied!", {
        id: "camera-access-denied",
      });
    }
  };

  const onSubmit = async () => {
    if (imgSrc) {
      setIsUploadingPhoto(true);
      try {
        const file = await dataURLtoFile(imgSrc, "captured_image");
        const result = await upload(file);
        navigate(`/search/visual/${result.key}`);
      } catch {
        errorToast("Could not search with this email, try again later.", {
          id: "error-uploading-photo",
        });
        setIsUploadingPhoto(false);
      }
    }
  };

  let content = (
    <div className="rounded-md p-1">
      {imgSrc ? (
        <Image
          src={imgSrc}
          className="h-auto w-auto rounded-md"
          alt="user-capture"
        />
      ) : (
        <Fragment>
          {/* @ts-expect-error - fix webcam types. */}
          <Webcam
            ref={webcamRef}
            height={600}
            width={600}
            className="h-full w-full rounded-lg"
          />
        </Fragment>
      )}
      <div className="mt-5">
        {imgSrc ? (
          <div className="flex space-x-3">
            <Button variant="solid" type="button" onClick={onSubmit}>
              Search
            </Button>
            <Button
              variant="outlined"
              color="primaryGhost"
              type="button"
              onClick={handleRetake}
            >
              Retake
            </Button>
          </div>
        ) : (
          <Button variant="solid" type="button" onClick={handleCapture}>
            Capture
          </Button>
        )}
      </div>
    </div>
  );

  if (cameraPermissionState === "denied") {
    content = (
      <div className="flex h-60 w-full flex-col items-center justify-center">
        <VideoCameraSlashIcon className="h-28 w-auto text-gray-200" />
        <p className="w-2/4 p-2 text-center text-xs">
          We don't have permission to access your camera.
        </p>
        <Button variant="solid" onClick={requestCameraAccess}>
          Allow Camera Access
        </Button>
      </div>
    );
  }

  return (
    <div className={classNames("relative", className)}>
      <div className="flex items-start justify-between p-2">
        <div>
          <h1 className="font-medium">Visual Search</h1>
          <span className="text-xs text-zinc-600">
            To search by images, you&apos;ll need to take a selfie
          </span>
        </div>
        <Button
          variant="unstyled"
          onClick={handleClose}
          className="text-xs text-zinc-600 hover:underline"
        >
          <XMarkIcon className="h-auto w-5" />
          {/* TODO: move this to some place else. */}
          {/* <span>Need Help?</span> */}
        </Button>
      </div>
      <div className="h-full bg-gray-50 p-3">{content}</div>
      {isUploadingPhoto ? (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded bg-white/95">
          <Loader />
        </div>
      ) : null}
    </div>
  );
};
