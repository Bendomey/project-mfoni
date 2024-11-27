import {USER_CIPHER} from '@/constants/index.ts'

export const extractAuthCookie = async (cookieString?: string | null) => {
  if (!cookieString) return null
  const cookies = cookieString.split(';')
  const authCookie = cookies.find(cookie => cookie.includes(USER_CIPHER))
  if (!authCookie) return null

  const [, value] = authCookie.split('=')
  return value ? value.replaceAll('%22', '') : null
}
