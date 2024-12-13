"use client"
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import { ArrowUpDown, ChevronsUpDownIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useGetCreatorApplications } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


const WALLET_TRANSACTION_PER_PAGE = 50;

export const WalletTransaction = () => {
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [openRejectModal, setOpenRejectModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<CreatorApplication>()
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get('page');
  const search = searchParams.get('search');
  const walletTransactionFilter = searchParams.get('type');

  const currentPage = parseInt(page ? (page as string) : "1", 10);

  const {data, isPending: isDataLoading, refetch, error} = useGetCreatorApplications({
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
      type: walletTransactionFilter
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
        cell: ({ row }) => (row.original.type ?
          <div className="lowercase">{row.original.type}</div> : 'N/A'
        ),
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
      // {
      //   id: "actions",
      //   enableHiding: false,
      //   cell: ({ row }) => {
      //     const payment = row.original
     
      //     return (
      //       <DropdownMenu>
      //         <DropdownMenuTrigger asChild>
      //           <Button variant="ghost" className="h-8 w-8 p-0">
      //             <span className="sr-only">Open menu</span>
      //             <DotsHorizontalIcon className="h-4 w-4" />
      //           </Button>
      //         </DropdownMenuTrigger>
      //         <DropdownMenuContent align="end">
      //           <DropdownMenuLabel>Options</DropdownMenuLabel>
      //           <DropdownMenuItem onClick={() => {
      //                 setSelectedApplication(row.original)
      //                 setOpenViewModal(true)
      //               }}><UserIcon className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
      //          {row.original.status === "SUBMITTED" ? (
      //           <>
      //           <DropdownMenuItem  onClick={() => {
      //             setSelectedApplication(row.original)
      //             setOpenApproveModal(true)
      //           }}><UserIcon className="mr-2 h-4 w-4"/>Approve</DropdownMenuItem>
                    
      //           <DropdownMenuItem onClick={() => {
      //             setSelectedApplication(row.original)
      //             setOpenRejectModal(true)
      //           }}><CreditCardIcon className="mr-2 h-4 w-4"/>Reject</DropdownMenuItem>  
      //           </>
      //         ): null }           
      //         </DropdownMenuContent>
      //       </DropdownMenu>
      //     )
      //   },
      // },
    ];
  }, []);

  return (
    <>
      <div className="px-7 mx-auto">
        <div className="flex flex-row justify-start pb-8">
          <div>
            <h2 className="text-4xl font-bold">Wallet Transactions</h2>
            <p className="text-lg text-gray-500">
              Here’s a list of wallets and transactions!
            </p>
          </div>
        </div>

        <div>
    <Card className="w-[650px]">
      <CardContent className="flex flex-row justify-between gap-12 pt-4">
        <div>
          <div className="flex flex-row justify-start gap-4 pb-3">
        <Button variant="outline">MFONI</Button>
        <Button>My Wallet</Button>
          </div>
        <p>This wallet is your default payment method for all purchases on this website.</p>
        </div>

        <div className="w-2/6">
          <h1 className="text-lg">GHC 150.00</h1>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4 p-4">
        <Button variant="outline">Deposit</Button>
        <Button>Withdraw</Button>
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
