interface Tag {
	id: string
	slug: string
	name: string
	description: NullableString
	createdByAdmin: Admin
	createdByUser: User
	createdAt: Date
	updatedAt: NullableDate
}

interface FetchTagFilter {
}
  