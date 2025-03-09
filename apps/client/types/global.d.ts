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

type SitemapEntry = {
	route: string
	lastmod?: string
	changefreq?:
		| 'always'
		| 'hourly'
		| 'daily'
		| 'weekly'
		| 'monthly'
		| 'yearly'
		| 'never'
	priority?: 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0
}

type Handle = {
	/** this just allows us to identify routes more directly rather than relying on pathnames */
	id?: string
	getSitemapEntries?:
		| ((
				request: Request,
		  ) =>
				| Promise<Array<SitemapEntry | null> | null>
				| Array<SitemapEntry | null>
				| null)
		| null
}
