interface Content {
	id: string
	title: string
	slug: string
	type: 'IMAGE'
	isFeatured: boolean
	isPurchased: boolean
	status: IContentStatus
	rejectedAt: Nullable<Date>
	doneAt: Nullable<Date>
	tagsId: Nullable<Array<string>>
	tags: Nullable<Array<Tag>>
	media: ContentMedia
	meta: ContentMeta
	orientation: IContentOrientation
	backgroundColor: Nullable<string>
	visibility: IContentVisibility
	amount: number
	currentUserLike: Nullable<ContentLike>
	createdById: string
	imageProcessingResponse: ImageProcessingResponse
	createdBy: Nullable<BasicCreator>
	createdAt: Date
	updatedAt: Date
}

interface ContentMeta {
	views: number
	downloads: number
	likes: number
}

interface ContentMedia {
	url: string
	orientation: IContentOrientation
	sizes: ContentMediaSizes
}

interface ContentMediaSizes {
	small: number
	medium: number
	large: number
	original: number
}

interface ContentMedia {
	location: string
	orientation: string
	size: number
	eTag: string
	key: string
	serverSideEncryption: string
	bucket: string
}

interface ImageProcessingResponse {
	status: IRekognitionMetaDataStatus
	message?: string
}

type IRekognitionMetaDataStatus =
	| 'PENDING'
	| 'INDEXED'
	| 'NOT_INDEXED'
	| 'FAILED'

type IContentVisibility = 'PUBLIC' | 'PRIVATE'
type IContentOrientation = 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE'
type IContentStatus = 'PROCESSING' | 'DONE' | 'REJECTED'

interface ContentLike {
	id: string
	contentId: string
	content: Nullable<Content>
	userId: string
	user: Nullable<BasicUser>
	createdAt: Date
	updatedAt: Date
}

interface FetchContentLikeFilter {
	contentId?: string
	userId?: string
	visibility?: string
	orientation?: string
}

interface FetchContentFilter {
	orientation?: string
	license?: string
	is_featured?: boolean
}
