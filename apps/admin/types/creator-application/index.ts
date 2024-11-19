interface CreatorApplication  {
  id: string;
  name: string;
  user: User;
  status: "submitted" | "canceled" | "approved";
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
  status?: "submitted" | "canceled" | "approved"
}