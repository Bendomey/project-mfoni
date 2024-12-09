type PackageType = 'FREE' | 'BASIC' | 'ADVANCED'

interface CreatorApplication {
  id: string
  userId: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt: Nullable<Date>
  approvedAt: Nullable<Date>
  rejectedAt: Nullable<Date>
  rejectedReason: Nullable<string>
  intendedPricingPackage: Nullable<PackageType>
  idType: Nullable<'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'VOTERS'>
  idFrontImage: Nullable<string>
  idBackImage: Nullable<string>
  createdAt: Date
  updatedAt: Date
}

interface Creator {
  id: string
  creatorApplicationId: string
  status: 'ACTIVE' | 'SUSPENDED'
  userId: string
  username: string
  socialMedia: Array<CreatorSocialMedia>
  subscription: CreatorSubscription
  createdAt: Date
  updatedAt: Date
}

interface CreatorSocialMedia {
  platform: 'FACEBOOK' | 'TWITTER' | 'GOOGLE' | 'INSTAGRAM' | 'YOUTUBE'
  handle: string
}

interface BasicCreator {
  id: string
  name: string
  username: string
  photo: string
  socialMedia: Array<CreatorSocialMedia>
}
