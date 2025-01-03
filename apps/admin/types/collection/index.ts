interface Collection {
  id: string
  name: string
  slug: string
  contentsCount: number
  description: string
  isFeatured: boolean
  createdByRole: string
  visibility: string
  createdById: string
  createdAt: Date
  updatedAt: NullableDate
  deletedBy: string
  deletedAt: NullableDate
}

interface FetchCollectionFilter {
  visibility?: string
}
