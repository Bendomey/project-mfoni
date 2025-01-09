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
import { useGetTags } from "@/api";
import { useSearchParams } from "next/navigation";
import { localizedDayjs } from "@/lib/date";
import { DataTableColumnHeader } from "@/components/table/components";
import { createDataTableError } from "@/lib/utils";
import { FeatureTagModal } from "./feature";
import { UnfeatureTagModal } from "./unfeature";

const TAGS_PER_PAGE = 50;

const filterFields: DataTableFilterField<Tag>[] = [
  {
    id: "name",
    label: "Name",
    placeholder: "Filter names...",
  },
]


export const ListTags = () => {
  const [openFeaturedModal, setOpenFeaturedModal] = useState(false);
  const [openUnFeaturedModal, setOpenUnFeaturedModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag>();
  const searchParams = useSearchParams();

  // Retrieve query parameters
  const page = searchParams.get("page");
  const search = searchParams.get("search");

  const currentPage = parseInt(page ? (page as string) : "0", 10);

  const {
    data,
    isPending: isDataLoading,
    refetch,
    error,
  } = useGetTags({
    pagination: {
      page: currentPage,
      per: TAGS_PER_PAGE,
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

  const dataTableError = createDataTableError(error, "Can't fetch tags");

  const columns = useMemo((): ColumnDef<Tag>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Name"} />,
        cell: ({ row }) => (<div className="capitalize flex flex-row justify-start align-middle">
        {row.original.isFeatured ? <StarIcon className="mr-2 h-4 w-4" color="gold"/> : <span className="mr-2 h-4 w-4"/> } {row.original.name}
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
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title={"Description"} />,
        cell: ({ row }) =>
          row.original.description ? (
            <div className="normal-case">{row.original.description}</div>
          ) : (
            "N/A"
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Created On",
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
                    setSelectedTag(row.original);
                    setOpenUnFeaturedModal(true)
                  }}
                >
                  <StarOffIcon className="mr-2 h-4 w-4" />
                  UnFeature
                </DropdownMenuItem>):(<DropdownMenuItem
                  onClick={() => {
                    setSelectedTag(row.original);
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
            <h2 className="text-4xl font-bold">Tags</h2>
            <p className="text-lg text-gray-500">Here’s a list of tags!</p>
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
            pageSize: TAGS_PER_PAGE,
            totalPages: data?.totalPages ?? 1,
          }}
        >
          
        </DataTable>
      </div>
     
      <FeatureTagModal
        opened={openFeaturedModal}
        setOpened={setOpenFeaturedModal}
        data={selectedTag}
        refetch={refetch}
      />

      <UnfeatureTagModal
        opened={openUnFeaturedModal}
        setOpened={setOpenUnFeaturedModal}
        data={selectedTag}
        refetch={refetch}
      />
    </>
  );
};
