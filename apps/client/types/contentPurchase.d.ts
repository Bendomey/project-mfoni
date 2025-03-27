interface ContentPurchase {
  id: string;
  amount: number;
  type: "ONE_TIME" | "WALLET" | "SAVED_CARD";
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  contentId: string;
  content: Nullable<Content>;
  paymentId: Nullable<string>;
  payment: Nullable<Payment>;
  walletFromId: Nullable<string>;
  walletFrom: Nullable<WalletTransaction>;
  walletToId: Nullable<string>;
  walletTo: Nullable<WalletTransaction>;
  savedCardId: Nullable<string>;
  // savedCard: Nullable<SavedCard>;
  createdById: string;
  createdBy: Nullable<BasicUser>;
  createdAt: Date;
  updatedAt: Date;
}

interface FetchContentPurchaseFilter {
  type?: "ONE_TIME" | "WALLET" | "SAVED_CARD";
  status?: "PENDING" | "SUCCESSFUL" | "FAILED" | "CANCELLED";
  contentId?: string;
  userId: string;
}
