/* eslint-disable @typescript-eslint/no-empty-interface */
interface WalletTransaction {
  id: string
  userId: string
  type: 'WITHDRAWAL' | 'DEPOSIT'
  amount: number
  reasonForTransfer: string
  paymentId: Nullable<string>
  createdAt: Date
  updatedAt: Date
}

interface FetchWalletTransactionFilter {
  type?: 'WITHDRAWAL' | 'DEPOSIT'
}
