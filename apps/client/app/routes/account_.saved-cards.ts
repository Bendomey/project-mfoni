import { type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getSavedCards } from "@/api/saved-cards/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { protectRouteLoader } from "@/lib/actions/protect-route-loader.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { SavedCardsModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs);
  if (res) {
    return res;
  }

  const queryClient = new QueryClient();
  const authCookie = await extractAuthCookie(
    loaderArgs.request.headers.get("cookie"),
  );
  const baseUrl = `${process.env.API_ADDRESS}/api`;

  if (authCookie) {
    queryClient.prefetchQuery({
      queryKey: [
        QUERY_KEYS.SAVED_CARDS,
        { pagination: { page: 0, per: 50 } },
      ],
      queryFn: () =>
        getSavedCards(
          { pagination: { page: 0, per: 50 }, },
          {
            authToken: authCookie.token,
            baseUrl,
          },
        ),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return jsonWithCache({
    dehydratedState,
    origin: getDomainUrl(loaderArgs.request),
  });
}

export const meta: MetaFunction<any> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "Saved Cards | mfoni",
    description: "Manage your saved cards here on mfoni",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "saved cards, cards, payment methods, wallet, mfoni",
  });

  return meta;
};

export default SavedCardsModule;
