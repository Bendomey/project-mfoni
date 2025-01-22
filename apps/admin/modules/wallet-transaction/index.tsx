"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/table";
import { ChevronsUpDownIcon, CreditCardIcon, WalletCardsIcon, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetWalletTransactions } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "./components/wallet";
import { convertPesewasToCedis, formatAmount } from "@/lib";

const WALLET_TRANSACTION_PER_PAGE = 50;

const filterFields: DataTableFilterField<WalletTransaction>[] = [
  {
    id: "type",
    label: "Type",
    options: [
      {
      label: 'Deposit',
      value: 'DEPOSIT',
      icon:  WalletIcon,
    },
      {
      label: 'Withdraw',
      value: 'WITHDRAW',
      icon: CreditCardIcon,
    }
    ],
  },
]


export const WalletTransaction = () => {
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get("page");
  const search = searchParams.get("search");
  const walletTransactionFilter = searchParams.get("type")?.toUpperCase();

  const currentPage = parseInt(page ? (page as string) : "0", 10);

  const {
    data,
    isPending: isDataLoading,
    refetch,
    error,
  } = useGetWalletTransactions({
    pagination: {
      page: currentPage,
      per: WALLET_TRANSACTION_PER_PAGE,
    },
    search: {},
    sorter: {
      sort: "asc",
      sortBy: "createdAt",
    },
    populate: [],
    filters: {
      type:
        walletTransactionFilter &&
        ["DEPOSIT", "WITHDRAW"].includes(walletTransactionFilter)
          ? (walletTransactionFilter as TransactionType)
          : undefined,
    },
  });

  const columns = useMemo((): ColumnDef<WalletTransaction>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              className="pl-0"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Transaction
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="capitalize font-semibold flex flex-row gap-2 items-center">
            <WalletCardsIcon size={20} /> Subscription{" "}
            <Badge
              variant="outline"
              className={`uppercase ${
                row.original.type == "DEPOSIT"
                  ? "bg-emerald-200 text-emerald-600"
                  : "bg-orange-200 text-orange-700"
              }`}
            >
              {row.original.type}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              className="pl-0"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Amount
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) =>
          row.original.amount ? (
            <div className="lowercase">{formatAmount(convertPesewasToCedis(row.original.amount))}</div>
          ) : (
            "N/A"
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Created On",
        cell: ({ row }) =>
          localizedDayjs(row.getValue("createdAt")).format("DD/MM/YYYY"),
      },
    ];
  }, []);

  return (
    <>
      <div className="px-7 mx-auto">
        <div className="flex flex-row justify-start pb-4">
          <div>
            <h2 className="text-4xl font-bold">Wallet Transactions</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Here’s a list of wallets and transactions!
            </p>
          </div>
        </div>

        <div className="pb-2 w-[650px]">
          <Wallet />
        </div>

        <DataTable
          columns={columns}
          data={data?.rows ?? []}
          isDataLoading={isDataLoading}
          error={
            error ? new Error("Can't fetch Wallet Transactions") : undefined
          }
          refetch={refetch}
          filterFields={filterFields}
          dataMeta={{
            total: data?.total ?? 0,
            page: currentPage,
            pageSize: WALLET_TRANSACTION_PER_PAGE,
            totalPages: data?.totalPages ?? 1,
          }}
        />
      </div>
    </>
  );
};
