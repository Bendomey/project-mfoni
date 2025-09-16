type MfoniPackageStatus =
	| 'MfoniPackage.Status.Active'
	| 'MfoniPackage.Status.Inactive'
type MfoniPackageCode =
	| 'MfoniPackage.Free'
	| 'MfoniPackage.Basic'
	| 'MfoniPackage.Advanced'

interface MfoniPackage {
	id: string
	code: MfoniPackageCode
	name: string
	description: Nullable<string>
	amount: number
	currency: 'GHS'
	features: Array<MfoniPackageFeature>
	status: MfoniPackageStatus
	createdAt: Date
	updatedAt: Date
}

type MfoniPackageFeatureType =
	| 'MfoniPackage.Feature.Type.Limit'
	| 'MfoniPackage.Feature.Type.Boolean'
	| 'MfoniPackage.Feature.Type.Numeric'
	| 'MfoniPackage.Feature.Type.Level'
type MfoniPackageFeatureCode =
	| 'MfoniPackage.Feature.UploadLimit'
	| 'MfoniPackage.Feature.PriceImages'
	| 'MfoniPackage.Feature.PortfolioCustom'
	| 'MfoniPackage.Feature.ContentOnPortfolio'
	| 'MfoniPackage.Feature.ContactLinks'
	| 'MfoniPackage.Feature.EarningsAnalytics'
	| 'MfoniPackage.Feature.WithdrawalLimit'
	| 'MfoniPackage.Feature.PriorityAds'
	| 'MfoniPackage.Feature.EarlyAccessToFeatures'

interface MfoniPackageFeature {
	code: MfoniPackageFeatureCode
	name: string
	description: Nullable<string>
	type: MfoniPackageFeatureType
	value: string
}

interface FetchMfoniPackageFilter {
	status?: MfoniPackageStatus
}
