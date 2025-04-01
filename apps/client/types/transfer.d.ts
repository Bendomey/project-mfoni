interface TransferRecipient {
	id: string
	createdById: string
	type: 'mobile_money' | 'ghipss'
	recipientCode: string
	currency: 'GHS'
	accountNumber: string
	accountName: string
	bankName: string
	bankCode: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Nullable<Date>
}

interface FetchTransferRecipientFilter {
	bankCode?: string
}
