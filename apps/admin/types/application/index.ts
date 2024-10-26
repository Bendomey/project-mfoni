interface Application  {
  id: string;
  name: string;
  status: "submitted" | "canceled" | "approved";
  email: string;
  createdAt: Date
  updatedAt: string
};
