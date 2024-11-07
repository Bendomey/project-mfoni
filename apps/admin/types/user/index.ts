interface User {
  id: string
  name: string
  role: string
  status: string
  email: string
  emailVerifiedAt: NullableDate
  phoneNumber: NullableString
  phoneNumberVerifiedAt: NullableDate
  photo: string
  createdAt: Date
  updatedAt: NullableDate
  deletedBy: string
  deletedAt: NullableDate
}

interface FetchUserFilter {
  status?: string
}
