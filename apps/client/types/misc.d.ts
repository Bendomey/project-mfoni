interface ApiResponse<T> {
    data: T
    errorMessage: Nullable<string>
    status: boolean
}