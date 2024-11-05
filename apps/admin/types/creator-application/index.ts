interface CreatorApplication  {
  id: string;
  name: string;
  status: "submitted" | "canceled" | "approved";
  email: string;
  createdAt: Date
  updatedAt: string
};

interface FetchCreatorApplicationFilter {
  status?: "submitted" | "canceled" | "approved"
}