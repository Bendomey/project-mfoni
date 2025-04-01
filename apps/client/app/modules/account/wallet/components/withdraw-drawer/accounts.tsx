import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { CreditCardIcon } from "@heroicons/react/24/solid";
import { useGetTransferRecipients } from "@/api/transfers/index.ts";
import { Button } from "@/components/button/index.tsx";
import { EmptyLottie } from "@/components/lotties/empty.tsx";
import { ErrorLottie } from "@/components/lotties/error.tsx";

interface Props {
  addNew: () => void;
}

export function AccountsListing({ addNew }: Props) {
  const { data, isPending, isError } = useGetTransferRecipients({
    pagination:{
      page: 0,
      per: 50
    }
  })

  if (isPending) {
    return (
      <div className="m-4 space-y-3">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div
            className="flex w-full items-center justify-between bg-gray-50 p-2"
            key={index}
          >
            <div className="flex items-center space-x-2">
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState retry={addNew} />;
  }

  if (!data?.rows.length) {
    return <EmptyState addNew={addNew} />;
  }

  return (
    <ul
      role="list"
      className="flex-1 divide-y divide-gray-200 overflow-y-auto scrollContainer mr-.5"
    >
      {data.rows.map((recipient) => (
        <li key={recipient.id}>
          <div className="group relative flex items-center px-5 py-6">
            <a className="-m-1 block flex-1 p-1">
              <div
                aria-hidden="true"
                className="absolute inset-0 group-hover:bg-gray-50"
              />
              <div className="relative flex min-w-0 flex-1 items-center">
                {recipient.bankCode === "VOD" ? (
                  <img
                    alt="telecel logo"
                    src="/images/vodafone.png"
                    className="h-auto w-10"
                  />
                ) : recipient.bankCode === "MTN" ? (
                  <img
                    alt="mtn logo"
                    src="/images/mtn_logo.png"
                    className="h-auto w-10"
                  />
                ) : recipient.bankCode === "ATL" ? (
                  <img
                    alt="airtel tigo logo"
                    src="/images/airtel_tigo.png"
                    className="h-auto w-10"
                  />
                ) : (
                  <CreditCardIcon className="size-8 text-gray-300" />
                )}
                <div className="ml-4 truncate">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {recipient.accountName}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {recipient.accountNumber}
                  </p>
                </div>
              </div>
            </a>
            <Button size="sm" className="relative">
              Pay
            </Button>
            <Menu
              as="div"
              className="relative ml-2 inline-block shrink-0 text-left"
            >
              <MenuButton className="group relative inline-flex size-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open options menu</span>
                <span className="flex size-full items-center justify-center rounded-full">
                  <EllipsisVerticalIcon
                    aria-hidden="true"
                    className="size-5 text-gray-400 group-hover:text-gray-500"
                  />
                </span>
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-9 top-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      Delete
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ addNew }: { addNew: () => void }) {
  return (
    <div className="py-20 text-center">
      <EmptyLottie />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 ">
        No accounts found.
      </h3>
      <p className="mt-1 px-10 text-sm text-gray-500">
        Get started by adding a new account.
      </p>
      <div className="mt-4">
        <Button onClick={addNew} size="sm">
          Add Account
        </Button>
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="py-20 text-center">
      <ErrorLottie />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 ">
        Error fetching accounts.
      </h3>
      <p className="mt-1 px-10 text-sm text-gray-500">
        An error occurred while fetching your accounts.
      </p>
      <div className="mt-4">
        <Button onClick={retry} size="sm">
          Retry
        </Button>
      </div>
    </div>
  );
}
