interface ApiResponse<T> {
  data: T
  errorMessage: Nullable<string>
  status: boolean
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
  fields?: Array<string> // not used on the api level.
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

type NullableString = string | null
type NullableNumber = number | null
type NumberLike = string | number
type NullableDate = Date | null
type StringList = Array<string>
type NullableStringList = Array<string> | null
type Empty = {}
