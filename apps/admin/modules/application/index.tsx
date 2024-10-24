"use client"; 
import { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"
import { DataTable } from "@/components/table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button";

const data: Payment[] = [
  {
    id: "m5gr84i9",
    name: "Domey Benjamin Armah Kessey Kofi",
    status: "submitted",
    email: "ken99@yahoo.com",
    updatedAt: `${new Date().toLocaleString('en-GB', { hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
  },
  {
    id: "3u1reuv4",
    name: "Gideon Bempong",
    status: "canceled",
    email: "Abe45@gmail.com",
    updatedAt: `${new Date().toLocaleString('en-GB', { hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
  },
  {
    id: "derv1ws0",
    name: "domey Benjamin",
    status: "approved",
    email: "Monserrat44@gmail.com",
    updatedAt: `${new Date().toLocaleString('en-GB', { hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
  },
  {
    id: "5kma53ae",
    name: "Fiifi Arkhurst Jr.",
    status: "submitted",
    email: "Silas22@gmail.com",
    updatedAt: `${new Date().toLocaleString('en-GB', { hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
  },
]
 
export type Payment = {
  id: string
  name: string
  status: "submitted" | "canceled" | "approved"
  email: string
  updatedAt: string
}
 

export const Application = () => {
 
  const columns = useMemo((): ColumnDef<Payment>[] => {
    return [
      {
        accessorKey: "name",   
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
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
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
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
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
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
    ]
  }, [])



  return (
    <>
    <div className="px-7 mx-auto">
      <div className="flex flex-row justify-start pb-8">
        <div>
        <h2 className="text-4xl font-bold">Creator Applications</h2>
        <p className="text-lg text-gray-500">Here’s a list of applications that needs attention!</p>
        </div>
      </div>

     <DataTable columns={columns} data={data} />
    </div>
    </>
  )
}
