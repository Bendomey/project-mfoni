interface Content {
  id: string
  type: 'IMAGE'
  status: IContentStatus
  rejectedAt: Nullable<Date>
  visibility: IContentVisibility
  doneAt: Nullable<Date>
  tags: Nullable<Array<Tag>>
  media: string
  amount: number
  createdById: string
  createdBy: Nullable<User>
  createdAt: Date
  updatedAt: Date
}

type IContentVisibility = 'PUBLIC' | 'PRIVATE'
type IContentStatus = 'PROCESSING' | 'DONE' | 'REJECTED'
