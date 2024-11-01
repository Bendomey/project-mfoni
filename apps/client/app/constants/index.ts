export const NODE_ENV = process.env.NODE_ENV
export const APP_NAME = 'mfoni'

export const TWITTER_BASE_URL = 'https://api.twitter.com'
export const TWITTER_ACCOUNT_URL = 'https://twitter.com/mfoniapp'
export const GITHUB_REPO_URL = 'https://github.com/Bendomey/project-mfoni'
export const MYLES_PUDO_URL = 'https://mylespudo.com'

export const USER_CIPHER = 'mfoni-account'

export const QUERY_KEYS = {
  TAGS: 'tags',
  CREATOR_APPLICATIONS: 'creatorApplications',
} as const

export const MFONI_PACKAGES: Array<PackageType> = ['FREE', 'BASIC', 'ADVANCED']

export const MFONI_PACKAGES_DETAILED: Record<PackageType, {name: string}> = {
  FREE: {
    name: 'Snap & Share (Free tier)',
  },
  BASIC: {
    name: 'Pro Lens (Basic Premium Tier)',
  },
  ADVANCED: {
    name: 'Master Shot (Premium Tier)',
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
  },
}
