"use client"
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import { ChevronsUpDownIcon, WalletCardsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetWalletTransactions } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";
import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const WALLET_TRANSACTION_PER_PAGE = 50;

export const WalletTransaction = () => {
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get('page');
  const search = searchParams.get('search');
  const walletTransactionFilter = (searchParams.get('type'))?.toUpperCase();

  const currentPage = parseInt(page ? (page as string) : "1", 10);

  const {data, isPending: isDataLoading, refetch, error} = useGetWalletTransactions({
    pagination: {
      page: currentPage,
      per: WALLET_TRANSACTION_PER_PAGE,
    },
    search: {},
    sorter: {
      sort: 'asc',
      sortBy: 'createdAt',
    },
    populate: [],
    filters: {
      type:  walletTransactionFilter &&  ["DEPOSIT", "WITHDRAW"].includes(walletTransactionFilter)
      ? (walletTransactionFilter as TransactionType)
      : undefined
    },
  })

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
        cell: ({ row }) => (<div className="capitalize font-semibold flex flex-row gap-2 items-center"><WalletCardsIcon size={20} /> Subscription <Badge variant='outline' className={`uppercase ${row.original.type == 'DEPOSIT' ? 'bg-emerald-200 text-emerald-600' : 'bg-orange-200 text-orange-700'}`}>{row.original.type}</Badge></div>),
      },
      {
        accessorKey: "email",
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
        cell: ({ row }) => ( row.original.amount ?
          <div className="lowercase">{row.original.amount}</div> : 'N/A'
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created On",
        cell: ({ row }) => (
          localizedDayjs(row.getValue("createdAt")).format("DD/MM/YYYY")
        ),
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

        <div className="pb-2">
    <Card className="w-[650px] dark:border-gray-600">
      <CardContent className="flex flex-col items-center justify-between gap-2 md:flex-row pt-4">
        <div>
          <div className="flex flex-row justify-start items-center gap-4 pb-3">
            <div className="rounded-md border border-gray-200 dark:border-gray-500 px-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-500">MFONI</span>
            </div>
            <h1 className="text-sm font-bold">My Wallet</h1>
          </div>
        <p className="text-sm text-gray-500 dark:text-gray-300">This wallet is your default payment method for all purchases on this website.</p>
        </div>

        <div className="flex items-end gap-1">
          <h1 className="text-3xl font-bold">GH₵&nbsp;150.00</h1>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4 py-2 px-3 border-t border-gray-200 dark:border-gray-600">
        <Button variant="outline">Deposit</Button>
        <Button className="bg-blue-600 hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600">Withdraw</Button>
      </CardFooter>
    </Card>
        </div>

        <DataTable
          columns={columns}
          data={data?.rows ?? []}
          isDataLoading={isDataLoading}
          error={
            error ? new Error("Can't fetch Wallet Transactions") : undefined
          }
          refetch={refetch}
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
