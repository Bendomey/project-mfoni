import { DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { AccountsListing } from "./accounts.tsx";
import { AddNewAccount } from "./add-account.tsx";
import { Drawer } from "@/components/drawer/index.tsx";
import { classNames } from "@/lib/classNames.ts";

const tabs = [
  { name: "Accounts", key: "ACCOUNTS", current: true },
  { name: "Add New", key: "ADD_NEW", current: false },
];

interface Props {
  isOpened: boolean;
  onClose: () => void;
}

export default function WidthdrawDrawer({ isOpened, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("ACCOUNTS");

  return (
    <Drawer
      isOpened={isOpened}
      onClose={onClose}
      canBeClosedWithBackdrop={false}
    >
      <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              My Withdrawal Methods
            </DialogTitle>
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                onClick={() => onClose()}
                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500"
              >
                <span className="absolute -inset-2.5" />
                <span className="sr-only">Close panel</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm md:text-xs text-gray-500">
              Manage your withdrawal methods here. We currently accept only{" "}
              <b>Ghanaian mobile money</b> and <b>bank accounts</b>.
            </p>
          </div>
        </div>
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="-mb-px flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.key)}
                  className={classNames(
                    tab.key === activeTab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium font-shantell",
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        {activeTab === "ACCOUNTS" ? (
          <AccountsListing addNew={() => setActiveTab("ADD_NEW")} />
        ) : activeTab === "ADD_NEW" ? (
          <AddNewAccount navigate={setActiveTab} />
        ) : null}
      </div>
    </Drawer>
  );
}
