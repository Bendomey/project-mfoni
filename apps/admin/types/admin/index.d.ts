interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  createdById: Admin | NullableString;
  updatedAt: NullableDate;
  updatedBy: Admin | NullableString;
}

interface FetchAdminFilter {
  email?: string;
}
