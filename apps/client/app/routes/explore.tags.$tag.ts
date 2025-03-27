import {
  type LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getTagBySlug, getTagContentsBySlug } from "@/api/tags/index.ts";
import { PAGES, QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { safeString } from "@/lib/strings.ts";
import { TagModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const queryClient = new QueryClient();

  const authCookie = await extractAuthCookie(
    loaderArgs.request.headers.get("cookie"),
  );

  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  let tag: Tag | undefined = undefined;
  try {
    tag = await getTagBySlug(safeString(loaderArgs.params.tag), {
      baseUrl,
      authToken: authCookie?.token,
    });
  } catch {
    // if tag is not found, return 404
    return redirect(PAGES.NOT_FOUND);
  }

  const slug = safeString(loaderArgs.params.tag);

  const query = {
    pagination: { page: 0, per: 50 },
    filters: {},
    populate: ["content", "content.createdBy"],
  };

  queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.TAGS, slug, "contents", query],
    queryFn: () =>
      getTagContentsBySlug(slug, query, {
        authToken: authCookie?.token,
        baseUrl,
      }),
  });

  const dehydratedState = dehydrate(queryClient);

  return jsonWithCache({
    dehydratedState,
    tag,
    origin: getDomainUrl(loaderArgs.request),
  });
}

export const meta: MetaFunction<typeof loader> = ({
  data,
  params,
  location,
}) => {
  return getSocialMetas({
    title: data?.tag ? `${data?.tag?.name} | mfoni` : "404: tag Not Found",
    description: `Browse through the carefully curated contents around "${params.tag}" — you could also submit your best work.`,
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "tags, digital tags, curated tags, ".concat(
      safeString(data?.tag?.name),
    ),
  });
};

export default TagModule;
