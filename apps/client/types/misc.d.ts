interface ApiResponse<T> {
  data: T
  errorMessage: Nullable<string>
  status: boolean
}

type NullableString = string | null
