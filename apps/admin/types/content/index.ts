interface Content {
  id: string
  title: string
  slug: string
  type: "IMAGE"
  status: string
  rejectedAt: NullableDate
  doneAt: NullableDate
  meta: ContentMeta
  isFeatured: boolean
  tags: Tag[]
  createdById: string
  amount: number
  createdAt: Date
  updatedAt: NullableDate
  deletedBy: string
  deletedAt: NullableDate
}

interface FetchContentFilter {
  status?: string
}

interface ContentMeta {
  views: number
  downloads: number
  likes: number
}
