interface Creator {
  id: string
  creatorApplicationId: string
  status: string
  userId: string
  username: string
  subscription: Subscription
  socialMedia: SocialMedia[]
  createdAt: Date
  updatedAt: NullableDate
  deletedBy: string
  deletedAt: NullableDate
}

interface FetchCreatorFilter {
  status?: string
}

interface SocialMedia {
  platform: string
  handle: string
}