interface ContentReportCase {
  id: string;
  caseNumber: string;
  contentId: string;
  content: Nullable<Content>;
  contentType: string;
  reasonForReport: string;
  breakingLocalLaws: string;
  additionalDetails: Nullable<string>;
  status: "SUBMITTED" | "ACKNOWLEDGED" | "RESOLVED";
  acknowledgedAt: Nullable<Date>;
  acknowledgedById: Nullable<string>;
  resolvedAt: Nullable<Date>;
  resolvedById: Nullable<string>;
  resolvedMessage: Nullable<string>;
  name: Nullable<string>;
  phone: Nullable<string>;
  email: Nullable<string>;

  // TODO: create a different output for client.
  // We don't need to expose this field to client app.
  createdById: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}
