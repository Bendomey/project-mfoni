import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { SearchModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  return jsonWithCache({
    origin: getDomainUrl(loaderArgs.request),
  });
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "Search | mfoni",
    description: "Search for content on mfoni",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
  });

  return meta;
};

export default SearchModule;
