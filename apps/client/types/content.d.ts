interface Content {
  id: string
  title: string
  slug: string
  type: 'IMAGE'
  status: IContentStatus
  rejectedAt: Nullable<Date>
  doneAt: Nullable<Date>
  tagsId: Nullable<Array<string>>
  tags: Nullable<Array<Tag>>
  media: ContentMedia
  meta: ContentMeta
  amount: number
  currentUserLike: Nullable<ContentLike>
  createdById: string
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
  orientation: string
  sizes: ContentMediaSizes
}

interface ContentMediaSizes {
  small: number
  medium: number
  large: number
  original: number
}

type IContentVisibility = 'PUBLIC' | 'PRIVATE'
type IContentOrientation = 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE'
type IContentStatus = 'PROCESSING' | 'DONE' | 'REJECTED'

interface ContentLike {
  id: string
  contentId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}
