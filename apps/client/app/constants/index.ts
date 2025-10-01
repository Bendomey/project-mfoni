export const NODE_ENV = process.env.NODE_ENV
export const APP_NAME = 'mfoni'

export const TWITTER_BASE_URL = 'https://api.twitter.com'
export const TWITTER_ACCOUNT_URL = 'https://twitter.com/mfoniapp'
export const GITHUB_REPO_URL = 'https://github.com/Bendomey/project-mfoni'
export const MYLES_PUDO_URL = 'https://mylespudo.com'

export const USER_CIPHER = 'mfoni-account'
export const RECENT_SEARCHES_KEY = 'mfoni-recent-searches'

export const QUERY_KEYS = {
	CURRENT_USER: 'current-user',
	TAGS: 'tags',
	CONTENT_PURCHASES: 'content-purchases',
	WALLET_TRANSACTIONS: 'wallet-transactions',
	SAVED_CARDS: 'saved-cards',
	CREATOR_SUBSCRIPTIONS: 'creator-subscriptions',
	CREATOR_APPLICATIONS: 'creator-applications',
	CONTENTS: 'contents',
	COLLECTIONS: 'collections',
	CONTENT_LIKES: 'content-likes',
	CREATORS: 'creators',
	EXPLORE: 'explore',
	TRANSFER_RECIPIENTS: 'transfer-recipients',
	TRANSFERS: 'transfers',
	MFONI_PACKAGES: 'mfoni-packages',
} as const

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
		ACCOUNT_UPLOADS: '/account/uploads',
		WALLET: '/account/wallet',
		PACKAGE_AND_BILLINGS: '/account/package-and-billings',
	},
	PHOTO: '/photos/:slug',
	TAGS: '/explore/tags',
	TAG: '/explore/tags/:tag',
	COLLECTIONS: '/explore/collections',
	COLLECTION: '/explore/collections/:collection',
	CONTENTS: '/explore/contents',
	SEARCH: {
		VISUAL: '/search/visual/:query',
		CREATORS: '/search/creators/:query',
		PHOTOS: '/search/photos/:query',
		COLLECTIONS: '/search/collections/:query',
	},
	CREATOR: {
		PHOTOS: '/:username',
		LIKES: '/:username/likes',
		COLLECTIONS: '/:username/collections',
	},
	REPORT: {
		CONTENTS: '/report/contents',
	},
}

// base64 1px png's generated from https://png-pixel.com/
const placeholderColor =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+/79fwAJaAPMsmQeyQAAAABJRU5ErkJggg==' // grey-10 as 1px png in base64
export const blurDataURL = `data:image/png;base64,${placeholderColor}`

export const DEFAULT_USERNAME_FOR_FETCHING_CREATORS = 'default-creator'
