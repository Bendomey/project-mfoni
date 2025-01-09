"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table";
import {
  StarIcon,
  StarOffIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useGetContents } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";
import { DataTableColumnHeader } from "@/components/table/components";
import { createDataTableError } from "@/lib/utils";
import { FeatureContentModal } from "./feature";
import { UnfeatureContentModal } from "./unfeature";

const CONTENTS_PER_PAGE = 50;

const filterFields: DataTableFilterField<Content>[] = [
  {
    id: "title",
    label: "Title",
    placeholder: "Filter titles...",
  },
]


export const ListContents = () => {
  const [openFeaturedModal, setOpenFeaturedModal] = useState(false);
  const [openUnFeaturedModal, setOpenUnFeaturedModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content>();
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get("page");
  const search = searchParams.get("search");
  const contentFilter = searchParams.get("status");

  const currentPage = parseInt(page ? (page as string) : "0", 10);

  const {
    data,
    isPending: isDataLoading,
    refetch,
    error,
  } = useGetContents({
    pagination: {
      page: currentPage,
      per: CONTENTS_PER_PAGE,
    },
    search: {
      fields: [""],
      query: search || undefined,
    },
    sorter: {
      sort: "asc",
      sortBy: "createdAt",
    },
    populate: [],
    filters: {},
  });

  const dataTableError = createDataTableError(error, "Can't fetch contents");

  const columns = useMemo((): ColumnDef<Content>[] => {
    return [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Title"} />,
        cell: ({ row }) => (<div className="capitalize flex flex-row justify-start align-middle">
        {row.original.isFeatured ? <StarIcon className="mr-2 h-4 w-4" color="gold"/> : <span className="mr-2 h-4 w-4"/> } {row.original.title}
        </div>),
      },
      {
        accessorKey: "slug",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Code"} />,
        cell: ({ row }) => (<div className="capitalize">
        {row.original.slug}
        </div>),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Amount"} />,
        cell: ({ row }) =>
          row.original.amount,
      },
      {
        accessorKey: "likes",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Likes"} />,
        cell: ({ row }) => (
          row.original.meta?.likes
        ),
      },
      {
        accessorKey: "downloads",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Downloads"} />,
        cell: ({ row }) => (
          row.original.meta?.downloads
        ),
      },
      {
        accessorKey: "views",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Views"} />,
        cell: ({ row }) => (
          row.original.meta?.views
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
                {row.original.isFeatured ?
                (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedContent(row.original);
                    setOpenUnFeaturedModal(true)
                  }}
                >
                  <StarOffIcon className="mr-2 h-4 w-4" />
                  UnFeature
                </DropdownMenuItem>):(
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedContent(row.original);
                    setOpenFeaturedModal(true)
                  }}
                >
                  <StarIcon className="mr-2 h-4 w-4" />
                  Feature
                </DropdownMenuItem>)}
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
            <h2 className="text-4xl font-bold">Contents</h2>
            <p className="text-lg text-gray-500">Here’s a list of contents!</p>
          </div>
        </div>

        <DataTable
        boxHeight={75}
          columns={columns}
          data={data?.rows ?? []}
          isDataLoading={isDataLoading}
          error={dataTableError}
          refetch={refetch}
          filterFields={filterFields}
          dataMeta={{
            total: data?.total ?? 0,
            page: currentPage,
            pageSize: CONTENTS_PER_PAGE,
            totalPages: data?.totalPages ?? 1,
          }}
        >
          
        </DataTable>
      </div>
     
      <FeatureContentModal
        opened={openFeaturedModal}
        setOpened={setOpenFeaturedModal}
        data={selectedContent}
        refetch={refetch}
      />

      <UnfeatureContentModal
        opened={openUnFeaturedModal}
        setOpened={setOpenUnFeaturedModal}
        data={selectedContent}
        refetch={refetch}
      />
    </>
  );
};
