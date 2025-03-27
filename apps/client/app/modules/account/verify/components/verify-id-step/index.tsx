import {
  CreditCardIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { useVerifyCreator } from "../../context.tsx";
import { Button } from "@/components/button/index.tsx";
import { classNames } from "@/lib/classNames.ts";
import { errorToast, successToast } from "@/lib/custom-toast-functions.tsx";
import { isBrowser } from "@/lib/is-browser.ts";
import { useAuth } from "@/providers/auth/index.tsx";

type MetricVerify = (type: string, payload: any, callback: any) => void;

type IDType = "GHANA_CARD" | "VOTER" | "PASSPORT" | "DRIVER_LICENCE";

declare global {
  interface Window {
    // TODO: type it later.
    Metric?: any;
  }
}

const getPlaceholderBasedOnType = (type: IDType) => {
  switch (type) {
    case "GHANA_CARD":
      return "GHA-XXXXXXXXX-X";
    case "VOTER":
      return "XXXXXXXXXXX";
    case "PASSPORT":
      return "GXXXXXXX";
    case "DRIVER_LICENCE":
      return "XXXXXXXXX";

    default:
      return "XXXXXXXX";
  }
};

interface FormValues {
  type: IDType;
  cardNumber: string;
  dob?: string;
}

const schema = Yup.object().shape({
  type: Yup.string()
    .oneOf(["GHANA_CARD", "VOTER", "PASSPORT", "DRIVER_LICENCE"])
    .required("Type is required"),
  cardNumber: Yup.string().required("Card Number is required"),
  dob: Yup.string(),
});

export const VerifyIdStep = () => {
  const loaderData = useLoaderData<{
    METRIC_CLIENT_ID: string;
    METRIC_CLIENT_SECRET: string;
  }>();
  const [metric, setMetric] = useState<{ verify: MetricVerify }>();
  const { currentUser } = useAuth();
  const { setActiveStep } = useVerifyCreator();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const idTypeSelected = watch("type");

  const init = useCallback(() => {
    if (window.Metric) {
      const metricInstance = new window.Metric({
        client_id: loaderData.METRIC_CLIENT_ID,
        client_secret: loaderData.METRIC_CLIENT_SECRET,
      });

      setMetric(metricInstance);
    }
  }, [loaderData.METRIC_CLIENT_ID, loaderData.METRIC_CLIENT_SECRET]);

  const onSubmit = (data: FormValues) => {
    if (data.type === "DRIVER_LICENCE" && !data.dob) {
      return errorToast("Date of Birth is required", { id: "dob-required" });
    }

    if (!currentUser?.phoneNumber) {
      return errorToast("Kindly verify your phone number to proceed", {
        id: "phone-number-required",
      });
    }

    if (metric?.verify) {
      const phoneNumber = `0${currentUser.phoneNumber.slice(-9)}`;
      metric.verify(
        data.type,
        {
          card_number: data.cardNumber,
          reference_id: phoneNumber,
          purpose: `Verifying ${currentUser.name}'s identity.`,
          phone_number: phoneNumber,
          date_of_birth: data.dob ?? undefined,
        },
        (results: { status: "FAILED" | "SUCCESSFUL" }) => {
          if (results.status === "SUCCESSFUL") {
            setActiveStep("welcome");
            return successToast("Your identity was verified successfully", {
              id: "identity-verification-success",
            });
          } else {
            return errorToast(
              "Failed to verify your account. Please try again.",
              {
                id: "identity-verification-failed",
              },
            );
          }
        },
      );
    } else {
      // throw error to sentry
      return errorToast("An error occurred. Please try again later", {
        id: "metric-error",
      });
    }
  };

  useEffect(() => {
    if (isBrowser) {
      init();
    }
  }, [init]);

  return (
    <div className="flex flex-col items-center">
      <CreditCardIcon className="mb-5 h-20 w-auto text-zinc-400" />
      <h1 className="text-3xl font-bold">Verify your ID</h1>

      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10">
          <div className="relative rounded-md shadow-sm">
            <label className="mb-3 text-sm text-gray-700">Type</label>
            <select
              {...register("type", { required: true })}
              className={classNames(
                "mt-1 block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
                errors.type ? "ring-red-500" : "",
              )}
            >
              <option value="">Please Select</option>
              <option value="GHANA_CARD">Ghana Card</option>
              <option value="VOTER">Voter&apos;s ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVER_LICENCE">Driver&apos;s License</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative rounded-md shadow-sm">
            <label className="mb-3 text-sm text-gray-700">Card Number</label>
            <input
              type="text"
              {...register("cardNumber", { required: true })}
              className={classNames(
                "mt-1 block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
                errors.cardNumber ? "ring-red-500" : "",
              )}
              placeholder={getPlaceholderBasedOnType(idTypeSelected)}
            />
            {errors.cardNumber ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center pr-3">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            ) : null}
          </div>
        </div>

        {idTypeSelected === "DRIVER_LICENCE" ? (
          <div className="mt-4">
            <div className="relative rounded-md shadow-sm">
              <label className="mb-3 text-sm text-gray-700">
                Date Of Birth
              </label>
              <input
                type="date"
                {...register("dob", { required: true })}
                className={classNames(
                  "mt-1 block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
                  errors.dob ? "ring-red-500" : "",
                )}
              />
              {errors.dob ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center pr-3">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <Button type="submit" className="mt-5 w-full justify-center" size="lg">
          Initiate Verification
        </Button>
      </form>
    </div>
  );
};
