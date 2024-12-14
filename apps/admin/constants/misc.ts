export const API_ADDRESS = process.env.NEXT_PUBLIC_API_URL + '/api'

export const APP_NAME = 'Mfoni Admin'

export const USER_CIPHER = '@mfoni-admin-account'

export const QUERY_KEYS = {
  ADMINISTRATORS: 'administrators',
  CREATOR_APPLICATIONS: 'creator-applications',
  USERS: 'users',
  WALLET_TRANSACTIONS: 'wallet-transactions',
  WALLET: 'wallet',
} as const
