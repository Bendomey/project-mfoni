import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Link, useSearchParams } from "@remix-run/react";
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Image } from "remix-image";
import { SelectPackage } from "./steps/select-package.tsx";
import { UploadDocuments } from "./steps/upload-documents/index.tsx";
import {
  useCreateCreatorApplication,
  useSubmitCreatorApplication,
  useUpdateCreatorApplication,
} from "@/api/creator-applications/index.ts";
import creatorSvg from "@/assets/creator-svg.png";
import { Button } from "@/components/button/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { Modal } from "@/components/modal/index.tsx";
import { errorMessagesWrapper } from "@/constants/error-messages.ts";
import { MFONI_PACKAGES, MFONI_PACKAGES_DETAILED } from "@/constants/index.ts";
import { errorToast, successToast } from "@/lib/custom-toast-functions.tsx";
import { useAuth } from "@/providers/auth/index.tsx";

interface Props {
  isOpened: boolean;
}

const steps = {
  package: SelectPackage,
  document: UploadDocuments,
};

export interface IImageType {
  url: string;
  name: string;
}

export function CreatorApplicationModal({ isOpened }: Props) {
  const { isNotVerified, currentUser, activeCreatorApplication } = useAuth();
  const {
    mutateAsync: creatorCreatorApplication,
    isPending: isCreatingApplication,
  } = useCreateCreatorApplication();
  const {
    mutateAsync: updateCreatorApplication,
    isPending: isUpdatingApplication,
  } = useUpdateCreatorApplication();
  const {
    mutateAsync: submitCreatorApplication,
    isPending: isSubmitingApplication,
  } = useSubmitCreatorApplication();

  const [step, setStep] = useState<keyof typeof steps>("package");
  const [searchParams, setSearchParams] = useSearchParams();
  const [mfoniPackage, setMfoniPackage] = useState<string>("");
  const [idType, setIdType] = useState<string>("");
  const [frontId, setFrontId] = useState<IImageType>();
  const [backId, setBackId] = useState<IImageType>();

  useEffect(() => {
    // when an active application is rejected, we'd want the user to create a new application with fresh information.
    if (
      activeCreatorApplication &&
      activeCreatorApplication.status !== "REJECTED"
    ) {
      if (activeCreatorApplication.intendedPricingPackage) {
        setMfoniPackage(activeCreatorApplication.intendedPricingPackage);
      }
      setIdType(activeCreatorApplication.idType ?? "");
      setFrontId(
        activeCreatorApplication.idFrontImage
          ? {
              url: activeCreatorApplication.idFrontImage,
              name: "front image",
            }
          : undefined,
      );
      setBackId(
        activeCreatorApplication.idBackImage
          ? {
              url: activeCreatorApplication.idBackImage,
              name: "back image",
            }
          : undefined,
      );
    }

    const packageFromUrl = searchParams.get("complete-creator-application");
    if (
      packageFromUrl &&
      (MFONI_PACKAGES as Array<string>).includes(packageFromUrl)
    ) {
      setMfoniPackage(packageFromUrl);
    }
  }, [activeCreatorApplication, searchParams]);

  const onClose = useCallback(() => {
    searchParams.delete("complete-creator-application");
    setSearchParams(searchParams, {
      preventScrollReset: true,
    });
  }, [searchParams, setSearchParams]);

  const isLoading = useMemo(
    () =>
      isCreatingApplication || isUpdatingApplication || isSubmitingApplication,
    [isCreatingApplication, isSubmitingApplication, isUpdatingApplication],
  );

  const isWalletLow = useMemo(() => {
    if (!currentUser) return false;

    // @ts-expect-error - we're making sure that if it's not in the object, it's false
    if (!MFONI_PACKAGES_DETAILED[mfoniPackage]) return false;

    return (
      currentUser.bookWallet <
      MFONI_PACKAGES_DETAILED[mfoniPackage as PackageType].amount
    );
  }, [currentUser, mfoniPackage]);

  const isNextButtonDisabled = useMemo(
    () => !mfoniPackage || isWalletLow,
    [isWalletLow, mfoniPackage],
  );
  const isCompleteButtonDisabled = useMemo(
    () =>
      !mfoniPackage ||
      !idType ||
      !frontId ||
      !backId ||
      isWalletLow ||
      isLoading,
    [backId, frontId, idType, isLoading, isWalletLow, mfoniPackage],
  );

  const handleSubmit = useCallback(async () => {
    try {
      if (!backId || !frontId) {
        return;
      }
      let creatorApplicationId: string | undefined;
      if (
        activeCreatorApplication &&
        activeCreatorApplication.status !== "REJECTED"
      ) {
        creatorApplicationId = activeCreatorApplication.id;
        await updateCreatorApplication({
          id: creatorApplicationId,
          idType,
          creatorPackageType: mfoniPackage,
          idBackImage: backId.url,
          idFrontImage: frontId.url,
        });
      } else {
        const newCreatorApplication = await creatorCreatorApplication({
          idType,
          creatorPackageType: mfoniPackage,
          idBackImage: backId.url,
          idFrontImage: frontId.url,
        });

        if (newCreatorApplication) {
          creatorApplicationId = newCreatorApplication.id;
        }
      }

      if (!creatorApplicationId) {
        return errorToast("Creator Application is Required");
      }

      await submitCreatorApplication(creatorApplicationId);
      successToast("Creator Application submitted.");

      window.location.href = "/account";
    } catch (error: unknown) {
      if (error instanceof Error) {
        errorToast(errorMessagesWrapper(error.message), {
          id: "submit-creator-application",
        });
      }
    }
  }, [
    activeCreatorApplication,
    backId,
    creatorCreatorApplication,
    frontId,
    idType,
    mfoniPackage,
    submitCreatorApplication,
    updateCreatorApplication,
  ]);

  const isAlreadyAppliedOrApproved = activeCreatorApplication
    ? ["SUBMITTED", "APPROVED"].includes(activeCreatorApplication.status)
    : false;

  let content: ReactElement;

  if (isNotVerified) {
    content = (
      <div className="flex flex-col items-center justify-center px-10 py-14 pt-10 text-center md:px-0">
        <ExclamationTriangleIcon className="mb-1 h-10 w-auto text-yellow-400" />

        <h1 className="text-lg font-bold">User not verified</h1>
        <p className="mt-1 text-sm">
          You can continue this application after verifying your account
        </p>
        <div className="flex flex-row items-center gap-2">
          <Button asChild={true} className="mt-5">
            <Link
              prefetch="intent"
              to={`/account/verify?return_to=/account?complete-creator-application=${
                searchParams.get("complete-creator-application") ?? "true"
              }`}
            >
              Verify Now
            </Link>
          </Button>
          <Button variant="outlined" onClick={onClose} className="mt-5">
            Close
          </Button>
        </div>
      </div>
    );
  } else if (isAlreadyAppliedOrApproved) {
    content = (
      <div className="flex flex-col items-center justify-center px-10 py-14 pt-10 text-center md:px-0">
        {activeCreatorApplication &&
        activeCreatorApplication.status == "APPROVED" ? (
          <>
            <Image src={creatorSvg} className="mb-2 h-20 w-auto" alt="" />
            <h1 className="text-lg font-bold">You are a creator!</h1>
            <p className="mt-1 text-sm">
              You can always change your package you&apos;re on{" "}
              <Link
                prefetch="intent"
                to="/#pricing"
                reloadDocument={true}
                className="text-blue-600"
              >
                here
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <DocumentMagnifyingGlassIcon className="mb-5 h-10 w-auto" />
            <h1 className="text-lg font-bold">
              You already have an application in review.
            </h1>
            <p className="mt-1 text-sm">
              Kindly wait for a response from support.
            </p>
          </>
        )}
        <Button onClick={onClose} className="mt-5 w-3/12">
          Close
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <div className="m-4">
          {step === "package" ? (
            <SelectPackage
              mfoniPackage={mfoniPackage}
              setMfoniPackage={setMfoniPackage}
              isWalletLow={isWalletLow}
            />
          ) : (
            <>
              <div className="mb-2 flex flex-row items-center">
                <Button
                  onClick={() => setStep("package")}
                  variant="unstyled"
                  className="text-sm font-bold"
                >
                  <ChevronLeftIcon className="mr-1 h-4 w-4" /> Back
                </Button>
              </div>
              <UploadDocuments
                idType={idType}
                setIdType={setIdType}
                frontId={frontId}
                setFrontId={setFrontId}
                backId={backId}
                setBackId={setBackId}
              />
            </>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t p-4">
          <Button
            variant="solid"
            type="button"
            color="secondaryGhost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {step === "package" ? (
            <Button
              variant="solid"
              type="button"
              disabled={isNextButtonDisabled}
              onClick={() => setStep("document")}
            >
              Next <ArrowRightIcon className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="solid"
              type="button"
              color="success"
              disabled={isCompleteButtonDisabled}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <Loader size="5" color="fill-white" />{" "}
                  <span className="ml-2">Submitting</span>
                </>
              ) : (
                <>
                  Complete <CheckIcon className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>
      </>
    );
  }

  return (
    <Modal
      className="relative w-full p-0 md:w-4/6 lg:w-3/6"
      onClose={onClose}
      isOpened={isOpened}
      canBeClosedWithBackdrop={false}
    >
      <div className="flex flex-row items-center justify-between bg-gray-100 p-4 text-gray-600">
        <h1 className="font-bold">Creator Application</h1>
      </div>
      {content}
    </Modal>
  );
}
