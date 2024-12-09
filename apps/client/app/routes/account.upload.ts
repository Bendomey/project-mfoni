import {UploadModule} from '@/modules/index.ts'
import {
  type MetaFunction,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
} from '@remix-run/node'
import {dehydrate, QueryClient} from '@tanstack/react-query'
import {extractAuthCookie} from '@/lib/actions/extract-auth-cookie.ts'
import {protectRouteLoader} from '@/lib/actions/protect-route-loader.ts'
import {getCollectionBySlug} from '@/api/collections/index.ts'
import {QUERY_KEYS} from '@/constants/index.ts'
import {jsonWithCache} from '@/lib/actions/json-with-cache.server.ts'
import {environmentVariables} from '@/lib/actions/env.server.ts'
import {createContent, type CreateContentInput} from '@/api/contents/index.ts'

export const meta: MetaFunction = () => {
  return [
    {title: 'Upload | mfoni'},
    {name: 'description', content: 'Upload your contents to the world'},
  ]
}

export async function action({request}: ActionFunctionArgs) {
  const authCookie = await extractAuthCookie(request.headers.get('cookie'))

  if (authCookie) {
    const formData = await request.formData()
    const contents = formData.get('contents')

    if (!contents) return {error: 'No content found'}

    const baseUrl = `${environmentVariables().API_ADDRESS}/api`

    const updatedContents: CreateContentInput = (
      JSON.parse(contents as string) as CreateContentInput
    ).map(content => ({
      ...content,
      content: {
        ...content.content,

        // Main reason for moving the operation to the server side. So that we don't expose the s3 bucket on the client.
        bucket: environmentVariables().S3_BUCKET,
      },
    }))

    try {
      await createContent(updatedContents, {
        authToken: authCookie.token,
        baseUrl,
      })

      // Let them see their contents.
      return redirect('/account')
    } catch (error: unknown) {
      if (error instanceof Error) {
        return {error: error.message}
      }
    }
  }

  return {error: 'Auth Not Available'}
}

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs)
  if (!res) {
    const queryClient = new QueryClient()
    const authCookie = await extractAuthCookie(
      loaderArgs.request.headers.get('cookie'),
    )

    const baseUrl = `${environmentVariables().API_ADDRESS}/api`

    if (authCookie) {
      const slug = `${authCookie.userId}_uploads`
      await queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.COLLECTIONS, slug, 'slug'],
        queryFn: () =>
          getCollectionBySlug(
            slug,
            {
              filters: {contentItemsLimit: 0},
            },
            {
              authToken: authCookie.token,
              baseUrl,
            },
          ),
      })
    }

    const dehydratedState = dehydrate(queryClient)
    return jsonWithCache({
      dehydratedState,
    })
  }

  return res
}

export default UploadModule
