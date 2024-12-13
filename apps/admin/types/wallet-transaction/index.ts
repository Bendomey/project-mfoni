interface WalletTransaction  {
  id: string;
  type: "DEPOSIT" | "WITHDRAW"
  amount: number;
  reasonForTransfer: string
  createdAt: Date
  updatedAt: NullableDate
};

interface FetchWalletTransactionFilter {
  type?: "DEPOSIT" | "WITHDRAW"
}