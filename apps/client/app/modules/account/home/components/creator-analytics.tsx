import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { useMemo } from "react";
import { PAGES } from "@/constants/index.ts";
import { convertPesewasToCedis, formatAmount } from "@/lib/format-amount.ts";
import { useAuth } from "@/providers/auth/index.tsx";

export const CreatorAnalytics = () => {
  const { currentUser } = useAuth();

  const subscriptionLink = useMemo(() => {
    if (currentUser?.role === "CREATOR" && currentUser.creator) {
      const startedAt = currentUser.creator.subscription.startedAt;
      const endedAt = currentUser.creator.subscription.endedAt;
      const isActive = endedAt
        ? dayjs().isAfter(startedAt) && dayjs().isBefore(endedAt)
        : dayjs().isAfter(startedAt);

      return (
        <Link
          prefetch="intent"
          to={PAGES.AUTHENTICATED_PAGES.PACKAGE_AND_BILLINGS}
          className="px-4 py-5 hover:bg-gray-50 sm:p-6"
        >
          <dt className="text-base font-normal text-gray-900">
            My Subscription
          </dt>
          <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div className="flex items-baseline text-2xl font-bold text-blue-600">
              <span className="truncate">
                {isActive ? "Active" : "Needs Setup"}
              </span>
            </div>
          </dd>
        </Link>
      );
    }
    return null;
  }, [currentUser]);

  return (
    <div className="">
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Your Analytics
        </h3>
        <h3 className="-mt-1 text-xs font-light leading-6 text-gray-900">
          This section is private to you
        </h3>
        <dl className="mt-2 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
          <dt
            title="Feature is not available yet. Check back later."
            className="px-4 py-5 hover:bg-gray-50 sm:p-6"
          >
            <div className="text-base font-normal text-gray-900">Followers</div>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-bold text-blue-600">
                <span className="truncate">0</span>
              </div>
            </dd>
          </dt>

          <Link
            prefetch="intent"
            to={PAGES.AUTHENTICATED_PAGES.WALLET}
            className="px-4 py-5 hover:bg-gray-50 sm:p-6"
          >
            <dt className="text-base font-normal text-gray-900">My Wallet</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-bold text-blue-600">
                <span className="truncate">
                  {formatAmount(
                    convertPesewasToCedis(currentUser?.wallet ?? 0),
                  )}
                </span>
              </div>
            </dd>
          </Link>

          {subscriptionLink}
        </dl>
      </div>
    </div>
  );
};
