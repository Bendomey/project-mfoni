interface Subscription {
  id: string
  packageType: string
  period: number
  startedAt: Date
  endedAt: NullableDate
  createdAt: Date
  updatedAt: NullableDate
}
