import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { classNames } from "@/lib/classNames.ts";
import { useAuth } from "@/providers/auth/index.tsx";

export function QuickActions() {
  const { isACreator } = useAuth();

  const actions = useMemo(() => {
    const actions = [];

    if (isACreator) {
      actions.push({
        name: "Purchases",
        href: "/account/purchases",
        initial: "P",
        current: false,
      });
    } else {
      actions.push({
        name: "Manage your Wallet",
        href: "/account/wallet",
        initial: "W",
        current: false,
      });
    }

    // TODO: bring this back after implmenting save cards.
    // actions.push({
    // 	name: 'Saved Cards',
    // 	href: '/account/saved-cards',
    // 	initial: 'C',
    // 	current: false,
    // })
    return actions;
  }, [isACreator]);

  return (
    <div>
      <div className="text-xs font-semibold leading-6 text-gray-400">
        Quick Actions
      </div>
      <ul className="-mx-2 mt-2 space-y-1">
        {actions.map((team) => (
          <li key={team.name}>
            <Link
              prefetch="intent"
              to={team.href}
              className={classNames(
                team.current
                  ? "bg-gray-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
              )}
            >
              <span
                className={classNames(
                  team.current
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-200 text-gray-400 group-hover:border-blue-600 group-hover:text-blue-600",
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium",
                )}
              >
                {team.initial}
              </span>
              <span className="truncate">{team.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
