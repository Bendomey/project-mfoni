"use client"
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import { ArrowUpDown, ChevronsUpDownIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ApproveApplicationModal } from "./approve";
import { RejectApplicationModal } from "./reject";

interface ApplicationProps {
  data: Application[];
  isDataLoading?: boolean;
  error?: Error | null;
  refetch?: VoidFunction;
}

export const Application = ({
  data,
  isDataLoading,
  error,
  refetch,
}: ApplicationProps) => {
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [openRejectModal, setOpenRejectModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application>()


  const columns = useMemo((): ColumnDef<Application>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
            Status
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("status")}</div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("updatedAt")}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original
     
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem><UserIcon className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
                <DropdownMenuItem  onClick={() => {
                      setSelectedApplication(row.original)
                      setOpenApproveModal(true)
                    }}><UserIcon className="mr-2 h-4 w-4"/>Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                      setSelectedApplication(row.original)
                      setOpenRejectModal(true)
                    }}><CreditCardIcon className="mr-2 h-4 w-4"/>Reject</DropdownMenuItem>             
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ];
  }, []);

  return (
    <>
      <div className="px-7 mx-auto">
        <div className="flex flex-row justify-start pb-8">
          <div>
            <h2 className="text-4xl font-bold">Creator Applications</h2>
            <p className="text-lg text-gray-500">
              Here’s a list of applications that needs attention!
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data}
          isDataLoading={isDataLoading}
          error={
            error ? new Error("Can't fetch Creator Applications") : undefined
          }
          refetch={refetch}
        />
      </div>
      <ApproveApplicationModal opened={openApproveModal} setOpened={setOpenApproveModal} data={selectedApplication} refetch={refetch}/>
      <RejectApplicationModal opened={openRejectModal} setOpened={setOpenRejectModal} data={selectedApplication} refetch={refetch}/>
    </>
  );
};
