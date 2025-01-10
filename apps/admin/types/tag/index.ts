interface Tag {
	id: string
	slug: string
	name: string
	description: NullableString
	isFeatured: boolean
	createdByAdmin: Admin
	createdByUser: User
	createdAt: Date
	updatedAt: NullableDate
}

interface FetchTagFilter {
}
  