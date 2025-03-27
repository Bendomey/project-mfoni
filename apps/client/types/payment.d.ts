interface Payment {
  id: string;
  amount: number;
  reference: string;
  accessCode: Nullable<string>;
  authorizationUrl: Nullable<string>;
  channel: Nullable<string>;
  successfulAt: Nullable<Date>;
  cancelledAt: Nullable<Date>;
  failedAt: Nullable<Date>;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}
