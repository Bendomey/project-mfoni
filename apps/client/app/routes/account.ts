import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getMfoniPackages } from "@/api/mfoni-packages/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { protectRouteLoader } from "@/lib/actions/protect-route-loader.ts";
import { AccountModule } from "@/modules/index.ts";

export const meta: MetaFunction = () => {
  return [
    { title: "My Account | mfoni" },
    { name: "description", content: "Welcome to mfoni!" },
    { name: "keywords", content: "mfoni" },
  ];
};
// export const loader = protectRouteLoader
export async function loader(loaderArgs: LoaderFunctionArgs) {
  const creatorRes = await protectRouteLoader(loaderArgs);

  // authorized to move on to next step
  if (!creatorRes) {
    const queryClient = new QueryClient();
    const baseUrl = `${environmentVariables().API_ADDRESS}/api`;

    const { currentUser } = loaderArgs.context as IMfoniRemixContext;

    // we don't want to prefetch mfoni packages data everytime on /account route.
    // so we make sure the user is only a "CLIENT" before prefetching mfoni data.
    // This is because they'll be the only ones needing the data.
    if (currentUser && "role" in currentUser && currentUser.role === "CLIENT") {
      const mfoniPackagesQuery: FetchMultipleDataInputParams<FetchMfoniPackageFilter> =
        {
          pagination: { page: 0, per: 5 },
          filters: {
            status: "MfoniPackage.Status.Active",
          },
          sorter: {
            sort: "asc",
            sortBy: "createdAt",
          },
        };

      await queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.MFONI_PACKAGES, mfoniPackagesQuery],
        queryFn: () =>
          getMfoniPackages(mfoniPackagesQuery, {
            baseUrl,
          }),
      });
    }

    const dehydratedState = dehydrate(queryClient);
    return jsonWithCache({
      dehydratedState,
    });
  }

  // shouldn't happen but just in case.
  return null;
}

export default AccountModule;
