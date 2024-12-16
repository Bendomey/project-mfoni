interface PaginationDataMeta {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  
  interface Pagination {
    per?: NumberLike
    page?: NumberLike
  }
  
  interface Sorter {
    sort?: 'asc' | 'desc'
    sortBy?: string
  }
  
  interface Search {
    query?: string
    fields?: Array<string>
  }

interface FetchMultipleDataInputParams<FilterT> {
    pagination?: Pagination
    sorter?: Sorter
    filters?: FilterT
    search?: Search
    populate?: StringList
}
  
interface FetchMultipleDataResponse<T> {
    rows: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
interface APIResponse<T> {
  parsedBody: {
    data: FetchMultipleDataResponse<T>
    message: string
    success: boolean
  }
}

type NullableString = string | null
type NullableNumber = number | null
type NumberLike = string | number
type NullableDate = Date | null
type StringList = Array<string>
type NullableStringList = Array<string> | null
type Empty = {}


interface ApiResponse<T> {
  data?: T
  message: string
  success: boolean
}

interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

interface DataTableFilterField<TData> {
  id: StringKeyOf<TData>
  label: string
  placeholder?: string
  options?: Option[]
}