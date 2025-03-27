import {
  type LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getExploreSections } from "@/api/explore/index.ts";
import { PAGES, QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { ExploreModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const queryClient = new QueryClient();
  const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

  try {
    await queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.EXPLORE],
      queryFn: () =>
        getExploreSections(
          {
            sorter: {
              sort: "asc",
              sortBy: "sort",
            },
            pagination: {
              page: 0,
              per: 50,
            },
          },
          {
            baseUrl,
          },
        ),
    });

    const dehydratedState = dehydrate(queryClient);
    return jsonWithCache({
      dehydratedState,
      origin: getDomainUrl(loaderArgs.request),
    });
  } catch {
    return redirect(PAGES.NOT_FOUND);
  }
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "Explore | mfoni",
    description:
      "mfoni offers millions of free, high-quality pictures. All pictures are free to download and use under the mfoni license.",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "explore, explore photos, explore images, explore pictures",
  });

  return meta;
};

export default ExploreModule;
