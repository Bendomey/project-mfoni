import {redirect, type LoaderFunction} from '@remix-run/node'
import {extractAuthCookie} from './extract-auth-cookie.ts'

export const protectRouteLoader: LoaderFunction = async ({request}) => {
  const cookieString = request.headers.get('cookie')
  if (cookieString) {
    const cookie = await extractAuthCookie(cookieString)
    if (cookie) {
      return null
    }
  }

  return redirect('/auth')
}
