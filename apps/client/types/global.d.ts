/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

type PossiblyUndefined<T> = T | undefined
type Nullable<T> = T | null
type StringList = Array<string>
type NumberList = Array<number>
type BooleanList = Array<boolean>
type StringRecord = Record<string, string>
type NumberRecord = Record<string, number>
type BooleanRecord = Record<string, boolean>
type StringMap = Map<string, string>
type NumberMap = Map<string, number>
type BooleanMap = Map<string, boolean>
type NumberLike = string | number
type Empty = {}

declare global {
	interface Window {
		ENV: {
			API_ADDRESS: string
			BUCKET: string
			FACEBOOK_APP_ID: string
			MFONI_GOOGLE_AUTH_CLIENT_ID: string
		}
		fbAsyncInit: any
		FB: any
		google: any
	}
}

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
	prevPage: Nullable<number>
	nextPage: Nullable<number>
}

interface ApiConfigForServerConfig {
	authToken?: string
	baseUrl: string
}

type IVisibility = 'PUBLIC' | 'PRIVATE'
