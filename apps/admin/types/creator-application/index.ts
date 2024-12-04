interface CreatorApplication  {
  id: string;
  name: string;
  user: User;
  status: "SUBMITTED" | "CANCELED" | "APPROVED";
  idBackImage: string
  idFrontImage: string
  idType: "NATIONAL_ID"
  intendedPricingPackage: string
  email: string;
  createdAt: Date
  approvedAt: NullableDate
  submittedAt: NullableDate
  updatedAt: NullableDate
};

interface FetchCreatorApplicationFilter {
  status?: "SUBMITTED" | "CANCELED" | "APPROVED"
}