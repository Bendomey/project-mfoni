type UserRole = 'CLIENT' | 'CREATOR'

interface User {
  id: string
  role: UserRole | null
  provider: 'GOOGLE' | 'TWITTER' | 'FACEBOOK'
  name: string
  oAuthId: string
  email: Nullable<string>
  emailVerifiedAt: Nullable<Date>
  phoneNumber: Nullable<string>
  phoneNumberVerifiedAt: Nullable<Date>
  username: Nullable<string>
  photo: Nullable<string>
  creatorApplicationId: Nullable<string>
  creatorApplication: Nullable<CreatorApplication>
  createdAt: Date
  updatedAt: Date
}

interface CreatorApplication {
  id: string
  userId: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt: Nullable<Date>
  approvedAt: Nullable<Date>
  rejectedAt: Nullable<Date>
  rejectedReason: Nullable<string>
  intendedPricingPackage: Nullable<'FREE' | 'BASIC' | 'ADVANCED'>
  idType: Nullable<'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'VOTERS'>
  idFrontImage: Nullable<string>
  idBackImage: Nullable<string>
  createdAt: Date
  createdBy: string
  updatedAt: Date
}
