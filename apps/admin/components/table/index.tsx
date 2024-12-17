import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { Button } from "../ui/button";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { LoadingContainer } from "../LoadingContainer";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from "next/navigation";
import { DataTableToolbar } from "./components";

interface DataTableProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement>{
  columns: ColumnDef<TData, TValue>[];
  /** An array of data to be displayed. Should default to [] if no data is passed. */
  data: TData[];
  boxHeight?: number;
  /** Tells whether data is being fetched or not. */
  isDataLoading?: boolean;
  /** Tells whether filter button should show or not. */
  showFilter?: boolean;
  error?: Error;
  /**
   * Function to trigger a refetch of data.
   * When not passed, you won't see button to help trigger refetch.
   */
  refetch?: () => void;
  dataMeta: PaginationDataMeta;
  /** React Table Columns array passed. */
    /**
   * An array of filter field configurations for the data table.
   * When options are provided, a faceted filter is rendered.
   * Otherwise, a search filter is rendered.
   */
  filterFields?: DataTableFilterField<TData>[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  boxHeight = 65,
  isDataLoading = false,
  error,
  dataMeta,
  refetch,
  filterFields,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [dataPerPage, setDataPerPage] = React.useState<number>(dataMeta.pageSize);

  const totalPages = Math.ceil(dataMeta.total / pageSize);  

  const router = useRouter()
  const searchParams = useSearchParams();

  const apiPageChange = (direction: "next" | "previous" | "first" | "last", page?: number) => {
      const params = new URLSearchParams(searchParams);
      const pageNumber = page !== undefined ? page : direction === "next" ? (dataMeta.page + 1) : dataMeta.page -1
      params.set("page", (pageNumber.toString()));
      router.push(`?${params.toString()}`);
  }

  const changePage = (direction: "next" | "previous" | "first" | "last") => {  
    let newPageIndex, isApiFetchNeeded, pageThreshold;
    let pageNumber = 0;
    
    // Calculate the new page index based on the direction
    switch (direction) {
      case "next":
        newPageIndex = Math.min(pageIndex + 1, totalPages - 1);
        pageThreshold = newPageIndex * pageSize;
        isApiFetchNeeded = pageThreshold >= dataPerPage
        if (isApiFetchNeeded){setDataPerPage(dataPerPage + dataMeta.pageSize); apiPageChange(direction)}
        break;
      case "previous":
        newPageIndex = Math.max(pageIndex - 1, 0);
        pageThreshold = newPageIndex * pageSize
        isApiFetchNeeded = pageThreshold < dataPerPage - dataMeta.pageSize
        if (isApiFetchNeeded){ setDataPerPage(dataPerPage - dataMeta.pageSize); apiPageChange(direction)}
        break;
      case "first":
        newPageIndex = 0;
        isApiFetchNeeded = dataMeta.pageSize !== dataPerPage
        pageNumber = isApiFetchNeeded ? 1 : 0
        if (isApiFetchNeeded) {setDataPerPage(dataMeta.pageSize); apiPageChange(direction, pageNumber)}
        break;
      case "last":
        newPageIndex = totalPages - 1;
        isApiFetchNeeded =  dataPerPage !==  (dataMeta.totalPages) * dataMeta.pageSize
        pageNumber = isApiFetchNeeded 
        ? Math.floor((newPageIndex * pageSize) / dataMeta.pageSize) + 1 
        : 0;
        if (isApiFetchNeeded){ setDataPerPage(dataMeta.totalPages === 1 ? 1 : (dataMeta.totalPages* dataMeta.pageSize)); apiPageChange(direction, pageNumber)}
        break;
      default:
        newPageIndex = pageIndex;
    }

    // Prevent invalid page navigation (below first page or above max page count)
    if (newPageIndex < 0 || newPageIndex >= totalPages) return;
    
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // Ensure pageIndex is within range
    const adjustedPageIndex = Math.min(pageIndex, Math.ceil(dataMeta.total / newPageSize) - 1); 
  
    setPageSize(newPageSize); // Update the page size
    setPageIndex(adjustedPageIndex); // Adjust pageIndex if needed
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex, // Current page index
        pageSize, // Rows per page
      },
    },
  });



  return (
    <>
     <ScrollArea className="w-full flex flex-col items-center justify-center" style={{height: `${boxHeight - 5}vh`}}>
      {isDataLoading ? (
        <LoadingContainer />
      ) : error ? (
        <div
          className={`flex flex-col justify-center items-center border rounded h-full`}
        >
          <p>An error occurred: {error.message}</p>
          {refetch && (
            <Button onClick={refetch} className="mt-4 mx-auto">
              Retry
            </Button>
          )}
        </div>
      ) : data && !data.length ? (
        <div
        className={`flex flex-col justify-center items-center border rounded h-full`}
        >
          <h2 className="mt-5 text-xl font-semibold">No data found</h2>

          {refetch ? (
            <>
              <p className="text-muted-foreground mt-2">
                Refresh now or come back later!
              </p>
              <Button className="mt-10" onClick={refetch}>
                Refresh
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground mt-2">Come back later!</p>
          )}
        </div>
      ) : data && (
        <>
          <div className="space-y-2.5 ">
          <DataTableToolbar table={table} filterFields={filterFields} />
          
          <div className="rounded-md border min-h-[410px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody className="">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </div>

          <div className="flex pt-4 items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
            Showing rows {pageIndex * pageSize + 1} - {Math.min((pageIndex + 1) * pageSize, dataMeta.total)} of {dataMeta.total} rows
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => {
                    handlePageSizeChange(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 25,50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pageIndex + 1} of{" "}
                {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() =>  changePage("first")}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <DoubleArrowLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => changePage("previous")}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => changePage("next")}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => changePage("last")}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <DoubleArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      </ScrollArea>
    </>
  );
}
