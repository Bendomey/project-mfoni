interface Collection {
	id: string
	slug: string
	contentsCount: number
	name: string
	description: string
	createdByRole: string
	visibility: IVisibility
	contentItems: Nullable<Array<CollectionContent>>
	createdAt: Date
	createdById: string
	createdBy: Nullable<BasicUser>
	updatedAt: Date
}

interface FetchCollectionFilter {
	contentItemsLimit?: number
	created_by?: string
	visibility?: string
	orientation?: string
}

interface CollectionContent {
	id: string
	type: string
	collectionId: string
	collection: Nullable<Collection>
	contentId: Nullable<string>
	content: Nullable<Content>
	tagId: Nullable<string>
	tag: Nullable<Tag>
	childCollectionId: Nullable<string>
	childCollection: Nullable<Collection>
	createdAt: '2024-12-08T15:15:55.967Z'
	updatedAt: '2024-12-08T15:15:55.967Z'
}
