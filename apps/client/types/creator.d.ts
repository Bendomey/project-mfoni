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
  commission: number
  bookCommission: number
  creatorPackage: Nullable<CreatorPackage>
  createdAt: Date
  updatedAt: Date
}

interface CreatorSocialMedia {
  platform: 'FACEBOOK' | 'TWITTER' | 'GOOGLE' | 'INSTAGRAM' | 'YOUTUBE'
  handle: string
}

interface CreatorPackage {
  id: string
  packageType: PackageType
  deactivatedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}
