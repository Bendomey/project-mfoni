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
import _ from "lodash";

const ADMINS_PER_PAGE = 50;

export const ListAdmins = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin>();
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get("page");
  const search = searchParams.get("search");
  const adminFilter = searchParams.get("status");

  const currentPage = parseInt(page ? (page as string) : "1", 10);

  const {
    data,
    isPending: isDataLoading,
    refetch,
    error,
  } = useGetAdmins({
    pagination: {
      page: currentPage,
      per: ADMINS_PER_PAGE,
    },
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
        cell: ({ row }) => <div>{_.upperFirst(row.original.name)}</div>,
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
      {
        accessorKey: "createdBy",
        header: ({ column }) => {
          return (
            <Button
              className="pl-0"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Created By
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) =>
          row.original.createdBy ? (
            <div>{_.upperFirst((row.original.createdBy as Admin).name)}</div>
          ) : (
            "N/A"
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
          dataMeta={{
            total: data?.total ?? 0,
            page: currentPage,
            pageSize: ADMINS_PER_PAGE,
            totalPages: data?.totalPages ?? 1,
          }}
        />
      </div>
    </>
  );
};
