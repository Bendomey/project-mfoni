import {USER_CIPHER} from '@/constants/index.ts'

export const extractAuthCookie = async (
  cookieString?: string | null,
): Promise<{token: string; userId: string} | null> => {
  if (!cookieString) return null
  const cookies = cookieString.split(';')
  const authCookie = cookies.find(cookie => cookie.includes(USER_CIPHER))
  if (!authCookie) return null

  const [, value] = authCookie.split('=')
  return value
    ? JSON.parse(value.replaceAll('%22', '"').replace('%2C', ','))
    : null
}
