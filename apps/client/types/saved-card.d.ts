interface SavedCard {
	id: string
	userId: string
	defaultedAt: Nullable<Date>
	cardType: string
	first6: string
	last4: string
	expiryYear: string
	expiryMonth: string
	bank: string
	channel: string
	reusable: boolean
	countryCode: string
	accountName: string
	email: string
	status: 'SavedCard.Status.Active' | 'SavedCard.Status.Inactive'
	createdAt: Date
	updatedAt: Date
}

interface FetchSavedCardFilter {
	status?: SavedCard['status']
	reusable?: boolean
}
