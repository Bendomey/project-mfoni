interface User {
  id: string
  role: 'CLIENT' | 'CREATOR'
  provider: 'GOOGLE' | 'TWITTER' | 'FACEBOOK'
  name: string
  oAuthId: string
  email: Nullable<string>
  phoneNumber: Nullable<string>
  verifiedPhoneNumberAt: Nullable<Date>
  username: Nullable<string>
  photo: Nullable<string>
  creatorApplicationId: Nullable<string>
  creatorApplication: Nullable<CreatorApplication>
  accountSetupAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}

interface CreatorApplication {
  id: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt: Nullable<Date>
  approvedAt: Nullable<Date>
  approvedBy: Nullable<string>
  rejectedAt: Nullable<Date>
  rejectedBy: Nullable<string>
  platformAggrementForm: Nullable<string>
  ghanaCardFront: Nullable<string>
  ghanaCardBack: Nullable<string>
  createdAt: Date
  createdBy: string
  updatedAt: Date
}
