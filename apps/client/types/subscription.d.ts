interface CreatorSubscription {
  id: string
  packageType: PackageType
  startedAt: Date
  endedAt: Nullable<Date>
  period: Nullable<number>
  creatorSubscriptionPurchases: Array<CreatorSubscriptionPurchase>
  createdAt: Date
  updatedAt: Date
}

interface CreatorSubscriptionPurchase {
  id: string
  creatorSubscriptionId: string
  type: 'WALLET' | 'CARD'
  savedCardId: Nullable<string>
  walletId: Nullable<string>
  amount: number
  createdAt: Date
  updatedAt: Date
}

interface FetchCreatorSubscriptionFilter {
  type?: PackageType
}
