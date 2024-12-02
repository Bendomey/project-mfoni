"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import {
  ArrowUpDown,
  ChevronsUpDownIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useGetAdmins } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";

export const ListAdmins = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin>();
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get("page");
  const search = searchParams.get("search");
  const adminFilter = searchParams.get("status");

  const {
    data,
    isPending: isDataLoading,
    refetch,
    error,
  } = useGetAdmins({
    search: {
      fields: ["name"],
      query: search || undefined,
    },
    sorter: {
      sort: "asc",
      sortBy: "createdAt",
    },
    populate: [],
    filters: {},
  });

  const columns = useMemo((): ColumnDef<Admin>[] => {
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
              Name
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="lowercase">{row.original.name}</div>,
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
              Email
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) =>
          row.original.email ? (
            <div className="lowercase">{row.original.email}</div>
          ) : (
            "N/A"
          ),
      },
      // {
      //   accessorKey: "phoneNumber",
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         className="pl-0"
      //         variant="ghost"
      //         onClick={() =>
      //           column.toggleSorting(column.getIsSorted() === "asc")
      //         }
      //       >
      //         Phone
      //         <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) =>
      //     row.original.phoneNumber ? (
      //       <div className="lowercase">{row.original.phoneNumber}</div>
      //     ) : (
      //       "N/A"
      //     ),
      // },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              className="pl-0"
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
          localizedDayjs(row.getValue("updatedAt")).format("DD/MM/YYYY hh:mm a")
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
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
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAdmin(row.original);
                    setOpenViewModal(true);
                  }}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, []);

  return (
    <>
      <div className="px-7 mx-auto">
        <div className="flex flex-row justify-start pb-8">
          <div>
            <h2 className="text-4xl font-bold">Admins</h2>
            <p className="text-lg text-gray-500">Here’s a list of all administrators!</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.rows ?? []}
          isDataLoading={isDataLoading}
          error={error ? new Error("Can't fetch administrators") : undefined}
          refetch={refetch}
        />
      </div>
    </>
  );
};
