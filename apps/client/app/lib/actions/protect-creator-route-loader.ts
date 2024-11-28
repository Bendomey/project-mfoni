import {redirect, type LoaderFunction} from '@remix-run/node'
import {extractAuthCookie} from './extract-auth-cookie.ts'
import {PAGES} from '@/constants/index.ts'
import {getFullUrlPath} from '../url-helpers.ts'
import {getCurrentUser} from '@/api/auth/index.ts'

export const protectCreatorRouteLoader: LoaderFunction = async ({request}) => {
  const cookieString = request.headers.get('cookie')
  const authToken = await extractAuthCookie(cookieString)

  if (authToken) {
    const res = await getCurrentUser(authToken)

    if (!res?.data.creator) {
      throw new Response(null, {
        status: 404,
        statusText: 'Not Found',
      })
    }

    return null
  }

  return redirect(
    `${PAGES.LOGIN}?return_to=${getFullUrlPath(new URL(request.url))}`,
  )
}
