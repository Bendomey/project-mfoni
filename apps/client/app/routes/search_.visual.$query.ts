import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { searchVisualContents } from "@/api/contents/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import {
  getDisplayUrl,
  getDomainUrl,
  validateLicense,
  validateOrientation,
} from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { safeString } from "@/lib/strings.ts";
import { SearchVisualModule } from "@/modules/search/visual/index.tsx";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const queryClient = new QueryClient();

  const authCookie = await extractAuthCookie(
    loaderArgs.request.headers.get("cookie"),
  );

  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  const query = {
    pagination: { page: 0, per: 50 },
    filters: {
      license: validateLicense(loaderArgs.params.license ?? "ALL"),
      orientation: validateOrientation(loaderArgs.params.orientation ?? "ALL"),
      mediaKey: safeString(loaderArgs.params.query),
    },
    populate: ["content.createdBy"],
  };

  queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.CONTENTS, "visual-search", query],
    queryFn: () =>
      searchVisualContents(query, {
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
  return getSocialMetas({
    title: `Visual search | mfoni`,
    description: "Search for content by scanning your face",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "search, visual, photos",
  });
};

export default SearchVisualModule;
