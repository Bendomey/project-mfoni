import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getContentPurchases } from "@/api/purchases/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { AccountContentsModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const queryClient = new QueryClient();

  const authCookie = await extractAuthCookie(
    loaderArgs.request.headers.get("cookie"),
  );

  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  if (authCookie) {
    const query = {
      filters: {
        userId: authCookie.id,
      },
      pagination: { page: 0, per: 50 },
      populate: ["contentPurchase.content", "content.createdBy"],
    };
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.CONTENT_PURCHASES, query],
      queryFn: () =>
        getContentPurchases(query, {
          authToken: authCookie.token,
          baseUrl,
        }),
    });

    const dehydratedState = dehydrate(queryClient);
    return jsonWithCache({
      dehydratedState,
      origin: getDomainUrl(loaderArgs.request),
    });
  }

  // this should never happen but just in case
  return null;
}

export const meta: MetaFunction<any> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "My Contents | mfoni",
    description: "Manage your contents here on mfoni",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "contents, manage contents, digital contents",
  });

  return meta;
};

export default AccountContentsModule;
