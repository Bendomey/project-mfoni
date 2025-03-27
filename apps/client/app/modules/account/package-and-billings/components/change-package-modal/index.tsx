import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePackageAndBillingsContext } from "../../context/index.tsx";
import { ConfirmAmount } from "./confirm-amount.tsx";
import { SelectPackage } from "./select-package.tsx";
import {
  useActiveSubscription,
  useCancelSubscription,
  useDeleteSubscription,
  useIsSubscriptionPendingDowngrade,
} from "@/api/subscriptions/index.ts";
import { Button } from "@/components/button/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { Modal } from "@/components/modal/index.tsx";
import { MFONI_PACKAGES_DETAILED, PAGES } from "@/constants/index.ts";
import { errorToast } from "@/lib/custom-toast-functions.tsx";
import { determineIfItsAnUpgradeOrDowngrade } from "@/lib/pricing-lib.ts";
import { safeString } from "@/lib/strings.ts";
import { useAuth } from "@/providers/auth/index.tsx";

interface Props {
  isOpened: boolean;
}

export function ChangePackageModal({ isOpened }: Props) {
  const [step, setStep] = useState<"select-package" | "confirm-amount">(
    "select-package",
  );
  const [mfoniPackage, setMfoniPackage] = useState<string>("");
  const [upgradeType, setUpgradeType] = useState<"INSTANT" | "DEFER">(
    "INSTANT",
  );
  const { setIsChangePackageModalOpened, activePackage } =
    usePackageAndBillingsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [annualBillingEnabled, setAnnualBillingEnabled] = useState(false);
  const { currentUser, activeSubcription } = useAuth();
  const [submittedForm, setSubmittedForm] = useState(false);

  const { mutate: activateSubscription } = useActiveSubscription();
  const { mutate: cancelSubscription } = useCancelSubscription();

  const subscriptionId = safeString(activeSubcription?.id);
  const {
    data: subscriptionPendingDowngrade,
    isPending: issubscriptionPendingDowngradeLoading,
  } = useIsSubscriptionPendingDowngrade(subscriptionId);
  const [isPendingDeletion, setIsPendingDeletion] = useState(false);
  const { mutate: deleteSubscription } = useDeleteSubscription();

  const onClose = useCallback(() => {
    setIsChangePackageModalOpened(false);
    searchParams.delete("change-package");
    setSearchParams(searchParams, {
      preventScrollReset: true,
    });
  }, [searchParams, setIsChangePackageModalOpened, setSearchParams]);

  useEffect(() => {
    const changePackageParam = searchParams.get("change-package");
    const packages = Object.keys(MFONI_PACKAGES_DETAILED);

    if (changePackageParam && packages.includes(changePackageParam)) {
      setMfoniPackage(changePackageParam);
    }
  }, [searchParams, setIsChangePackageModalOpened]);

  const amountToBePaid = useMemo(() => {
    let period = 1;

    if (annualBillingEnabled) {
      period = 12;
    }

    if (!mfoniPackage) return 0;

    const selectedPackage =
      MFONI_PACKAGES_DETAILED[mfoniPackage as PackageType];

    return selectedPackage.amount * period;
  }, [annualBillingEnabled, mfoniPackage]);

  const isWalletLow = useMemo(() => {
    if (!currentUser) return false;

    return currentUser.bookWallet < amountToBePaid;
  }, [currentUser, amountToBePaid]);

  const handleSubmit = async () => {
    setSubmittedForm(true);

    const pricingChange = determineIfItsAnUpgradeOrDowngrade({
      activePackage: activePackage?.id as PackageType,
      changePackage: mfoniPackage as PackageType,
    });

    if (pricingChange === "DOWNGRADE" && mfoniPackage === "FREE") {
      // call cancel subscription api instead
      cancelSubscription(undefined, {
        onSuccess: () => {
          window.location.href = PAGES.AUTHENTICATED_PAGES.PACKAGE_AND_BILLINGS;
        },
        onError: () => {
          errorToast("Failed to activate FREE subscription, try again later.");
          setSubmittedForm(false);
        },
      });

      return;
    }

    activateSubscription(
      {
        period: annualBillingEnabled ? 12 : 1,
        pricingPackage: mfoniPackage as PackageType,
        upgradeEffect: upgradeType,
      },
      {
        onSuccess: () => {
          window.location.href = PAGES.AUTHENTICATED_PAGES.PACKAGE_AND_BILLINGS;
        },
        onError: () => {
          errorToast("Failed to activate subscription, try again later.");
          setSubmittedForm(false);
        },
      },
    );
  };

  const isCompleteButtonDisabled = useMemo(
    () => !mfoniPackage || submittedForm || isWalletLow,
    [isWalletLow, mfoniPackage, submittedForm],
  );

  const handleDeletion = () => {
    if (subscriptionPendingDowngrade?.id) {
      setIsPendingDeletion(true);
      deleteSubscription(subscriptionPendingDowngrade.id, {
        onSuccess: () => {
          window.location.href = PAGES.AUTHENTICATED_PAGES.PACKAGE_AND_BILLINGS;
        },
        onError: () => {
          errorToast("Failed to cancel subscription, try again later.");
        },
      });
    }
  };

  if (issubscriptionPendingDowngradeLoading) {
    return (
      <Modal
        className="relative w-full bg-transparent p-0 shadow-none md:w-4/6 lg:w-3/6"
        onClose={onClose}
        isOpened={isOpened}
        canBeClosedWithBackdrop={false}
      >
        <div className="my-10 flex justify-center">
          <Loader size="10" />
        </div>
      </Modal>
    );
  }

  if (Boolean(subscriptionPendingDowngrade)) {
    const packageChange = determineIfItsAnUpgradeOrDowngrade({
      activePackage: activePackage?.id as PackageType,
      changePackage: subscriptionPendingDowngrade?.packageType as PackageType,
    });

    return (
      <Modal
        className="relative w-full p-0 md:w-4/6 lg:w-3/6"
        onClose={onClose}
        isOpened={isOpened}
        canBeClosedWithBackdrop={false}
      >
        <div className="my-10 flex justify-center">
          <div className="flex flex-col items-center justify-center px-10 py-14 pt-10 text-center md:px-0">
            <ExclamationTriangleIcon className="mb-1 h-10 w-auto text-yellow-400" />

            <h1 className="text-lg font-bold">
              You{" "}
              {packageChange === "UPGRADE"
                ? "upgraded"
                : packageChange === "DOWNGRADE"
                  ? "downgraded"
                  : ""}{" "}
              your subscription
            </h1>
            <p className="mx-5 mt-1 text-sm">
              You have a subscription pending. To stop this{" "}
              {packageChange === "UPGRADE"
                ? "upgrade"
                : packageChange === "DOWNGRADE"
                  ? "downgrade"
                  : ""}
              , you can cancel it.
            </p>
            <div className="flex flex-row items-center gap-2">
              <Button
                className="mt-5"
                color="danger"
                disabled={isPendingDeletion}
                onClick={() => handleDeletion()}
              >
                Cancel Subscription
              </Button>
              <Button variant="outlined" onClick={onClose} className="mt-5">
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
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
        <h1 className="font-bold">Change Plan</h1>
      </div>
      <div className="m-4">
        {step === "select-package" ? (
          <SelectPackage
            annualBillingEnabled={annualBillingEnabled}
            setAnnualBillingEnabled={setAnnualBillingEnabled}
            mfoniPackage={mfoniPackage}
            setMfoniPackage={setMfoniPackage}
          />
        ) : null}

        {step === "confirm-amount" ? (
          <div>
            <div className="mb-2 flex flex-row items-center">
              <Button
                onClick={() => setStep("select-package")}
                variant="unstyled"
                className="text-sm font-bold"
              >
                <ChevronLeftIcon className="mr-1 h-4 w-4" /> Back
              </Button>
            </div>
            <ConfirmAmount
              setUpgradeType={setUpgradeType}
              upgradeType={upgradeType}
              isWalletLow={isWalletLow}
              period={annualBillingEnabled ? 12 : 1}
              mfoniPackage={mfoniPackage}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t p-4">
        <Button
          variant="solid"
          type="button"
          color="secondaryGhost"
          onClick={onClose}
        >
          Cancel
        </Button>

        {step === "select-package" ? (
          <Button
            variant="solid"
            type="button"
            disabled={!mfoniPackage}
            onClick={() => setStep("confirm-amount")}
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
            {submittedForm ? (
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
    </Modal>
  );
}
