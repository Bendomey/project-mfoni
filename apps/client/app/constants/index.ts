export const NODE_ENV = process.env.NODE_ENV
export const APP_NAME = 'mfoni'

export const TWITTER_BASE_URL = 'https://api.twitter.com'
export const TWITTER_ACCOUNT_URL = 'https://twitter.com/mfoniapp'
export const GITHUB_REPO_URL = 'https://github.com/Bendomey/project-mfoni'
export const MYLES_PUDO_URL = 'https://mylespudo.com'

export const USER_CIPHER = 'mfoni-account'

export const QUERY_KEYS = {
	CURRENT_USER: 'current-user',
	TAGS: 'tags',
	WALLET_TRANSACTIONS: 'wallet-transactions',
	CREATOR_SUBSCRIPTIONS: 'creator-subscriptions',
	CREATOR_APPLICATIONS: 'creator-applications',
	CONTENTS: 'contents',
	COLLECTIONS: 'collections',
	CONTENT_LIKES: 'content-likes',
} as const

export const MFONI_PACKAGES: Array<PackageType> = ['FREE', 'BASIC', 'ADVANCED']
export interface IMfoniPackageDetail {
	name: string
	id: string
	amount: number
	uploadLimit: number
}
export const MFONI_PACKAGES_DETAILED: Record<PackageType, IMfoniPackageDetail> =
	{
		FREE: {
			name: 'Snap & Share (Free tier)',
			amount: 0,
			id: 'FREE',
			uploadLimit: 50,
		},
		BASIC: {
			name: 'Pro Lens (Basic Premium Tier)',
			amount: 5000,
			id: 'BASIC',
			uploadLimit: 200,
		},
		ADVANCED: {
			name: 'Master Shot (Premium Tier)',
			amount: 10000,
			id: 'ADVANCED',
			uploadLimit: Number.POSITIVE_INFINITY, // inifinity
		},
	}

export const PAGES = {
	NOT_FOUND: '/page/not-found',
	LOGIN: '/auth',
	HOME: '/',
	EXPLORE: '/explore',
	PRIVACY_POLICY: '/privacy',
	TERMS: '/terms',
	AUTHENTICATED_PAGES: {
		ONBOARDING: '/auth/onboarding',
		UPLOAD: '/account/upload',
		ACCOUNT: '/account',
		ACCOUNT_COLLECTIONS: '/account/collections',
		ACCOUNT_LIKES: '/account/likes',
		WALLET: '/account/wallet',
		PACKAGE_AND_BILLINGS: '/account/package-and-billings',
	},
	PHOTO: '/photos/:slug',
	TAGS: '/tags',
	TAG: '/tags/:tag',
	COLLECTIONS: '/collections',
	COLLECTION: '/collections/:collection',
	SEARCH: {
		CREATORS: '/search/creators/:query',
		PHOTOS: '/search/photos/:query',
		COLLECTIONS: '/search/collections/:query',
	},
	CREATOR: {
		PHOTOS: '/:username',
		LIKES: '/:username/likes',
		COLLECTIONS: '/:username/collections',
	},
}

// base64 1px png's generated from https://png-pixel.com/
const placeholderColor =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+/79fwAJaAPMsmQeyQAAAABJRU5ErkJggg==' // grey-10 as 1px png in base64
export const blurDataURL = `data:image/png;base64,${placeholderColor}`
