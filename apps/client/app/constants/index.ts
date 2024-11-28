export const NODE_ENV = process.env.NODE_ENV
export const APP_NAME = 'mfoni'

export const TWITTER_BASE_URL = 'https://api.twitter.com'
export const TWITTER_ACCOUNT_URL = 'https://twitter.com/mfoniapp'
export const GITHUB_REPO_URL = 'https://github.com/Bendomey/project-mfoni'
export const MYLES_PUDO_URL = 'https://mylespudo.com'

export const USER_CIPHER = 'mfoni-account'

export const QUERY_KEYS = {
  TAGS: 'tags',
  WALLET_TRANSACTIONS: 'wallet-transactions',
  CREATOR_SUBSCRIPTIONS: 'creator-subscriptions',
  CREATOR_APPLICATIONS: 'creatorApplications',
} as const

export const MFONI_PACKAGES: Array<PackageType> = ['FREE', 'BASIC', 'ADVANCED']

export const MFONI_PACKAGES_DETAILED: Record<
  PackageType,
  {name: string; id: string; amount: number}
> = {
  FREE: {
    name: 'Snap & Share (Free tier)',
    amount: 0,
    id: 'FREE',
  },
  BASIC: {
    name: 'Pro Lens (Basic Premium Tier)',
    amount: 5000,
    id: 'BASIC',
  },
  ADVANCED: {
    name: 'Master Shot (Premium Tier)',
    amount: 10000,
    id: 'ADVANCED',
  },
}

export const PAGES = {
  LOGIN: '/auth',
  HOME: '/',
  EXPLORE: '/explore',
  PRIVACY_POLICY: '/privacy',
  TERMS: '/terms',
  AUTHENTICATED_PAGES: {
    ONBOARDING: '/auth/onboarding',
    UPLOAD: '/upload',
    ACCOUNT: '/account',
    WALLET: '/account/wallet',
    PACKAGE_AND_BILLINGS: '/account/package-and-billings',
  },
}
