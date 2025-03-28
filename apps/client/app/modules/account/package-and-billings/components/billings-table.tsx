import {
  ArrowDownTrayIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { Fragment, useState } from "react";
import { useGetCreatorSubscriptions } from "@/api/subscriptions/index.ts";
import { Button } from "@/components/button/index.tsx";
import { Pagination } from "@/components/pagination/index.tsx";
import { MFONI_PACKAGES_DETAILED } from "@/constants/index.ts";
import { classNames } from "@/lib/classNames.ts";
import { convertPesewasToCedis, formatAmount } from "@/lib/format-amount.ts";
import { useAuth } from "@/providers/auth/index.tsx";

export function BillingsTable() {
  const { activeSubcription } = useAuth();
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "0";
  const { data, isError, isLoading } = useGetCreatorSubscriptions({
    pagination: {
      page: Number(page),
      per: 50,
    },
    populate: ["purchase", "wallet"],
  });

  let content = <></>;

  if (isLoading) {
    content = (
      <div className="m-4 space-y-3">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div
            className="flex w-full items-center justify-between bg-gray-50 p-2"
            key={index}
          >
            <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <div className="py-20 text-center">
        <ExclamationCircleIcon className="mx-auto h-12 w-auto text-red-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Subscriptions failed to fetch.
        </h3>
        <p className="mt-1 px-10 text-sm text-gray-500">Try again later.</p>
      </div>
    );
  } else if (data?.rows.length === 0) {
    content = (
      <div className="py-20 text-center">
        <FolderPlusIcon className="mx-auto h-12 w-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No subscription found.
        </h3>
        <p className="mt-1 px-10 text-sm text-gray-500">
          Get started by subscribing to a premium package.
        </p>
      </div>
    );
  } else if (data?.rows.length) {
    content = (
      <table className="min-w-full table-fixed divide-y divide-gray-200 border-t border-gray-200">
        <thead>
          <tr>
            <th
              scope="col"
              className="min-w-[12rem] px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
            >
              Package
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
            >
              Start Date
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
            >
              Expiring date
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
            >
              Amount
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.rows.length ? (
            <>
              {data.rows.map((sub) => {
                const isActive = activeSubcription?.id === sub.id;
                const isUpcoming = dayjs().isBefore(sub.startedAt);
                const pkg = MFONI_PACKAGES_DETAILED[sub.packageType];

                return (
                  <Fragment key={sub.id}>
                    <tr
                      className={classNames("relative border-gray-200", {
                        "bg-gray-50": isActive,
                        "border-b": selectedSub !== sub.id,
                      })}
                    >
                      {isActive ? (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-600" />
                      ) : null}
                      <td
                        className={classNames(
                          "flex items-center gap-1 whitespace-nowrap py-4 pl-2 pr-3 text-sm font-medium",
                          isActive ? "text-blue-600" : "text-gray-900",
                        )}
                      >
                        {sub.creatorSubscriptionPurchases?.length ? (
                          <Button
                            onClick={() =>
                              setSelectedSub((prev) =>
                                prev === sub.id ? null : sub.id,
                              )
                            }
                            type="button"
                            variant="unstyled"
                          >
                            {selectedSub === sub.id ? (
                              <ChevronDownIcon className="h-5 w-auto" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-auto" />
                            )}
                          </Button>
                        ) : null}
                        <DocumentTextIcon className="h-6 w-auto" />
                        {pkg.name}
                        {sub.packageType === "FREE" || isUpcoming ? null : (
                          <span className="ml-1 inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                            <CheckIcon className="h-3 w-auto" />
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {isActive ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                            Active
                          </span>
                        ) : isUpcoming ? (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {dayjs(sub.startedAt).format("ll")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {sub.endedAt ? dayjs(sub.endedAt).format("ll") : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {formatAmount(convertPesewasToCedis(pkg.amount))}
                      </td>
                      <td className="flex whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <Button
                          disabled={isUpcoming}
                          size="sm"
                          variant="outlined"
                          title="Download Receipt"
                          className="px-2"
                        >
                          <ArrowDownTrayIcon className="h-5 w-auto text-gray-600" />
                        </Button>
                      </td>
                    </tr>

                    {selectedSub === sub.id
                      ? sub.creatorSubscriptionPurchases?.map(
                          (purchase, index) => (
                            <tr
                              key={purchase.id}
                              className={classNames(
                                "relative w-full border-gray-200",
                                {
                                  "bg-gray-50": isActive,
                                  "border-b":
                                    index ===
                                    (sub.creatorSubscriptionPurchases ?? [])
                                      .length -
                                      1,
                                },
                              )}
                            >
                              <td className="pb-2 pl-20 text-sm text-gray-500">
                                {isActive ? (
                                  <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-600" />
                                ) : null}
                                {purchase.walletTransaction?.type === "DEPOSIT"
                                  ? "Refund"
                                  : "Payment"}{" "}
                                #{index + 1} -{" "}
                                {dayjs(purchase.createdAt).format("dddd, MMM")}
                              </td>
                              <td />
                              <td />
                              <td className="px-3 text-xs">
                                {formatAmount(
                                  convertPesewasToCedis(purchase.amount),
                                )}
                              </td>
                              <td className="px-3 pb-2">
                                <span className="text-bue-700 ring-bue-700/10 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium capitalize ring-1 ring-inset">
                                  {purchase.type.toLowerCase()} Transaction
                                </span>
                              </td>
                              <td />
                            </tr>
                          ),
                        )
                      : null}
                  </Fragment>
                );
              })}
            </>
          ) : null}
        </tbody>
      </table>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white pb-1 pt-5">
      <div className="px-4 sm:flex sm:items-center sm:px-6 lg:px-5">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">
            Billing history
          </h1>
          <p className="mt-1 text-sm text-gray-700">
            Download your previous package reciepts and usage details
          </p>
        </div>
      </div>
      <div className="mt-5 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">{content}</div>
          </div>
        </div>
      </div>
      {data ? <Pagination data={data} /> : null}
    </div>
  );
}
