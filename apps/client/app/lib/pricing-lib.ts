interface IDetermineIfItsAnUpgradeOrDowngradeInput {
	activePackage: MfoniPackage
	changePackage: MfoniPackage
}

export const determineIfItsAnUpgradeOrDowngrade = ({
	activePackage,
	changePackage,
}: IDetermineIfItsAnUpgradeOrDowngradeInput) => {
	const levels = ['MfoniPackage.Free', 'MfoniPackage.Basic', 'MfoniPackage.Advanced']

	const oldPackageIndex = levels.indexOf(activePackage.code)
	const newPackageIndex = levels.indexOf(changePackage.code)

	if (newPackageIndex > oldPackageIndex) {
		return 'UPGRADE'
	}

	if (newPackageIndex < oldPackageIndex) {
		return 'DOWNGRADE'
	}

	return 'NO_CHANGE'
}

export const isPackagePremium = (mfoniPackage: MfoniPackage) =>
	mfoniPackage.code !== 'MfoniPackage.Free'

export const getPriceForPackage = (mfoniPackage: MfoniPackage) => {
	return mfoniPackage.amount
}

export const getPriceForPackagePerDay = (mfoniPackage: MfoniPackage) => {
	return mfoniPackage.amount / 30
}

export const getPackageUploadLimit = (mfoniPackage: MfoniPackage) => {
	// TODO: come back to this
	return 10;
	// return mfoniPackage.uploadLimit
}
