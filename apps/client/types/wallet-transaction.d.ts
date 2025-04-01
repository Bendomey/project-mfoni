interface WalletTransaction {
	id: string
	userId: string
	type: 'WITHDRAWAL' | 'DEPOSIT'
	amount: number
	reasonForTransfer: string
	status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED'
	successfulAt: Nullable<Date>
	failedAt: Nullable<Date>
	cancelledAt: Nullable<Date>
	paymentId: Nullable<string>
	createdAt: Date
	updatedAt: Date
}

interface FetchWalletTransactionFilter {
	type?: 'WITHDRAWAL' | 'DEPOSIT'
}
