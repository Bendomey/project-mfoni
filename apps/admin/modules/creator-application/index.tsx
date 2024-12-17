"use client"
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import { ArrowUpDown, CheckCheckIcon, ChevronsUpDownIcon, ClockAlertIcon, CreditCardIcon, MailCheckIcon, RotateCcwIcon, UserIcon } from "lucide-react";
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
import { ApproveApplicationModal } from "./approve";
import { RejectApplicationModal } from "./reject";
import { useGetCreatorApplications } from "@/api";
import { useSearchParams } from "next/navigation";
import { ViewApplicationModal } from "./view";
import { localizedDayjs } from "@/lib/date";

const CREATOR_APPLICATION_PER_PAGE = 50;

const filterFields: DataTableFilterField<CreatorApplication>[] = [
  {
    id: "email",
    label: "Email",
    placeholder: "Filter email...",
  },
  {
    id: "status",
    label: "Status",
    options: [
      {
      label: 'Pending',
      value: 'PENDING',
      icon: ClockAlertIcon,
    },
    {
    label: 'Submitted',
    value: 'SUBMITTED',
    icon: MailCheckIcon,
  },
      {
      label: 'Approved',
      value: 'APPROVED',
      icon:  CheckCheckIcon,
    },
    ],
  },
]


export const CreatorApplication = () => {
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [openRejectModal, setOpenRejectModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<CreatorApplication>()
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get('page');
  const search = searchParams.get('search');
  const creatorApplicationFilter = searchParams.get('status');

  const currentPage = parseInt(page ? (page as string) : "1", 10);

  const {data, isPending: isDataLoading, refetch, error} = useGetCreatorApplications({
    pagination: {
      page: currentPage,
      per: CREATOR_APPLICATION_PER_PAGE,
    },
    search: {
      fields: ['firstName'],
      query:  search || undefined,
    },
    sorter: {
      sort: 'asc',
      sortBy: 'createdAt',
    },
    populate: [],
    filters: {
    },
  })

  const columns = useMemo((): ColumnDef<CreatorApplication>[] => {
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
        cell: ({ row }) => (row.original.user ?
          <div className="lowercase">{row.original.user.email}</div> : 'N/A'
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
        cell: ({ row }) => ( row.original.user ?
          <div className="lowercase">{row.original.user.email}</div> : 'N/A'
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
                <DropdownMenuItem onClick={() => {
                      setSelectedApplication(row.original)
                      setOpenViewModal(true)
                    }}><UserIcon className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
               {row.original.status === "SUBMITTED" ? (
                <>
                <DropdownMenuItem  onClick={() => {
                  setSelectedApplication(row.original)
                  setOpenApproveModal(true)
                }}><UserIcon className="mr-2 h-4 w-4"/>Approve</DropdownMenuItem>
                    
                <DropdownMenuItem onClick={() => {
                  setSelectedApplication(row.original)
                  setOpenRejectModal(true)
                }}><CreditCardIcon className="mr-2 h-4 w-4"/>Reject</DropdownMenuItem>  
                </>
              ): null }           
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
          data={data?.rows ?? []}
          isDataLoading={isDataLoading}
          error={
            error ? new Error("Can't fetch Creator Applications") : undefined
          }
          refetch={refetch}
          filterFields={filterFields}
          dataMeta={{
            total: data?.total ?? 0,
            page: currentPage,
            pageSize: CREATOR_APPLICATION_PER_PAGE,
            totalPages: data?.totalPages ?? 1,
          }}
        />
      </div>
      <ViewApplicationModal opened={openViewModal} setOpened={setOpenViewModal} data={selectedApplication} refetch={refetch}/>
      <ApproveApplicationModal opened={openApproveModal} setOpened={setOpenApproveModal} data={selectedApplication} refetch={refetch}/>
      <RejectApplicationModal opened={openRejectModal} setOpened={setOpenRejectModal} data={selectedApplication} refetch={refetch}/>
    </>
  );
};
