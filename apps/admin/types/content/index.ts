interface Content {
  id: string
  status: string
  createdAt: Date
  updatedAt: NullableDate
  deletedBy: string
  deletedAt: NullableDate
}

interface FetchContentFilter {
  status?: string
}
