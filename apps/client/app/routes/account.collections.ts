import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getCollections } from "@/api/collections/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { protectCreatorRouteLoader } from "@/lib/actions/protect-creator-route-loader.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { AccountCollectionsModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const creatorRes = await protectCreatorRouteLoader(loaderArgs);
  if (!creatorRes) {
    const queryClient = new QueryClient();

    const authCookie = await extractAuthCookie(
      loaderArgs.request.headers.get("cookie"),
    );

    const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

    if (authCookie) {
      const query = {
        pagination: { page: 0, per: 50 },
        filters: {
          created_by: authCookie.id,
          visibility: "ALL",
        },
        populate: ["content"],
      };
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.COLLECTIONS, authCookie.id, query],
        queryFn: () =>
          getCollections(query, {
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
  }

  return creatorRes;
}

export const meta: MetaFunction<any> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "My Collections | mfoni",
    description: "Manage your collections here on mfoni",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "collections, manage collections, digital collections",
  });

  return meta;
};

export default AccountCollectionsModule;
