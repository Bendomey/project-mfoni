import { PhotoIcon } from "@heroicons/react/24/outline";
import { type IImageType } from "../../index.tsx";
import { Button } from "@/components/button/index.tsx";
import { UploadDialog } from "@/components/upload-dialog/index.tsx";
import { useDisclosure } from "@/hooks/use-disclosure.tsx";

interface Props {
  idType: string;
  setIdType: (value: string) => void;
  frontId?: IImageType;
  setFrontId: (value: IImageType) => void;
  backId?: IImageType;
  setBackId: (value: IImageType) => void;
}

export function UploadDocuments({
  idType,
  setIdType,
  frontId,
  setFrontId,
  backId,
  setBackId,
}: Props) {
  return (
    <div>
      <h1 className="text-xl font-bold">2. Upload Your ID Card</h1>
      <div className="ml-5">
        <p className="mt-1 text-sm text-gray-600">
          Any type of Ghanaian ID Card is acceptable. Please make sure the
          images are not blurry. Your application might get rejected because of
          that
        </p>

        <div className="mt-5">
          <label
            htmlFor="type"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            ID Type
          </label>
          <div className="mt-1 lg:w-4/6">
            <select
              id="type"
              name="type"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="block w-full rounded-md border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="">Please Select</option>
              <option value="NATIONAL_ID">Ghana Card</option>
              <option value="VOTERS">Voter&apos;s ID</option>
              <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
            </select>
          </div>
        </div>
        {idType ? (
          <>
            <div className="mt-3">
              <label
                htmlFor="type"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Front
              </label>
              <UploadItem image={frontId} setImage={setFrontId} />
            </div>

            <div className="mt-3">
              <label
                htmlFor="type"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Back
              </label>
              <UploadItem image={backId} setImage={setBackId} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface UploadItemProps {
  image?: IImageType;
  setImage: (value: IImageType) => void;
}

function UploadItem({ image, setImage }: UploadItemProps) {
  const {
    isOpened: isUploadDialogOpened,
    onClose: onCloseUploadDialog,
    onOpen: onOpenUploadDialog,
  } = useDisclosure();

  return (
    <>
      <div className="mt-1 w-full">
        <div className="flex w-full items-center justify-between rounded-md bg-gray-50 p-3">
          <div className="flex flex-row items-center gap-x-2">
            {image ? (
              <>
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-10 w-auto rounded-md"
                />
                <span className="text-xs text-gray-600">{image.name}</span>
              </>
            ) : (
              <>
                <PhotoIcon className="h-10 w-auto text-gray-400" />
                <span className="text-xs text-gray-400">Nothing Selected.</span>
              </>
            )}
          </div>
          <div>
            <Button size="sm" variant="outlined" onClick={onOpenUploadDialog}>
              {image ? "Update" : "Upload"}
            </Button>
          </div>
        </div>
      </div>
      <UploadDialog
        isOpened={isUploadDialogOpened}
        onClose={onCloseUploadDialog}
        onSave={(res) => {
          setImage(res);
          onCloseUploadDialog();
        }}
      />
    </>
  );
}
