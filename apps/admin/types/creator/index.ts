interface Creator {
  id: string
  creatorApplicationId: string
  status: string
  userId: string
  username: string
  createdAt: Date
  updatedAt: NullableDate
  deletedBy: string
  deletedAt: NullableDate
}

interface FetchCreatorFilter {
  status?: string
}



  // "socialMedia": [
  //   {
  //     "platform": "string",
  //     "handle": "string"
  //   }
  // ],
