interface WalletTransaction  {
  id: string;
  type: TransactionType
  amount: number;
  reasonForTransfer: string
  createdAt: Date
  updatedAt: NullableDate
};

interface FetchWalletTransactionFilter {
  type?: TransactionType
}

type TransactionType = "DEPOSIT" | "WITHDRAW"
