"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import {
  ArrowUpDown,
  ChevronsUpDownIcon,
  CreditCardIcon,
  PaletteIcon,
  UserIcon,
  UserRoundIcon,
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
import { useGetUsers } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";

const USERS_PER_PAGE = 50;

const filterFields: DataTableFilterField<User>[] = [
  // {
  //   id: "title",
  //   label: "Title",
  //   placeholder: "Filter titles...",
  // },
  {
    id: "role",
    label: "Role",
    options: [
      {
      label: 'Creator',
      value: 'CREATOR',
      icon:  PaletteIcon,
    },
      {
      label: 'Client',
      value: 'CLIENT',
      icon: UserRoundIcon,
    }
    ],
  },
]


export const ListUsers = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>();
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get("page");
  const search = searchParams.get("search");
  const userFilter = searchParams.get("status");

  const currentPage = parseInt(page ? (page as string) : "1", 10);

  const {
    data,
    isPending: isDataLoading,
    refetch,
    error,
  } = useGetUsers({
    pagination: {
      page: currentPage,
      per: USERS_PER_PAGE,
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

  const columns = useMemo((): ColumnDef<User>[] => {
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
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <Button
            className="pl-0"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
            Role
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("role")}</div>
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
        accessorKey: "phoneNumber",
        header: ({ column }) => {
          return (
            <Button
              className="pl-0"
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Phone
              <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) =>
          row.original.phoneNumber ? (
            <div className="lowercase">{row.original.phoneNumber}</div>
          ) : (
            "N/A"
          ),
      },
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
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          localizedDayjs(row.getValue("createdAt")).format("DD/MM/YYYY")
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
                    setSelectedUser(row.original);
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
            <h2 className="text-4xl font-bold">Users</h2>
            <p className="text-lg text-gray-500">Here’s a list of all users!</p>
          </div>
        </div>

        <DataTable
        boxHeight={75}
          columns={columns}
          data={data?.rows ?? []}
          isDataLoading={isDataLoading}
          error={error ? new Error("Can't fetch users") : undefined}
          refetch={refetch}
          filterFields={filterFields}
          dataMeta={{
            total: data?.total ?? 0,
            page: currentPage,
            pageSize: USERS_PER_PAGE,
            totalPages: data?.totalPages ?? 1,
          }}
        >
          
        </DataTable>
      </div>
    </>
  );
};
