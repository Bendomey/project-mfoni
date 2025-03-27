import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getContents } from "@/api/contents/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { LandingPageModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const queryClient = new QueryClient();

  const authCookie = await extractAuthCookie(
    loaderArgs.request.headers.get("cookie"),
  );

  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  const query = {
    pagination: { page: 0, per: 20 },
    filters: {
      // is_featured: true,
    },
    populate: ["content.createdBy"],
  };
  queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.CONTENTS, query],
    queryFn: () =>
      getContents(query, {
        authToken: authCookie?.token,
        baseUrl,
      }),
  });

  const dehydratedState = dehydrate(queryClient);
  return jsonWithCache({
    dehydratedState,
    origin: getDomainUrl(loaderArgs.request),
  });
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const meta = getSocialMetas({
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "images, portfolio, upload, pricing",
  });

  return meta;
};

export default LandingPageModule;
