import { type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getWalletTransactions } from "@/api/wallet-transactions/index.ts";
import { QUERY_KEYS } from "@/constants/index.ts";
import { extractAuthCookie } from "@/lib/actions/extract-auth-cookie.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { protectRouteLoader } from "@/lib/actions/protect-route-loader.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { WalletModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs);
  if (!res) {
    const queryClient = new QueryClient();
    const searchParams = new URL(loaderArgs.request.url).searchParams;
    const page = searchParams.get("page") ?? "0";
    const authCookie = await extractAuthCookie(
      loaderArgs.request.headers.get("cookie"),
    );
    const baseUrl = `${process.env.API_ADDRESS}/api`;

    if (authCookie) {
      queryClient.prefetchQuery({
        queryKey: [
          QUERY_KEYS.WALLET_TRANSACTIONS,
          { pagination: { page: Number(page), per: 10 } },
        ],
        queryFn: () =>
          getWalletTransactions(
            { pagination: { page: Number(page), per: 10 } },
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

  return res;
}

export const meta: MetaFunction<any> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "Your Wallet | mfoni",
    description: "Manage your e-wallet and its transactions here on mfoni",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "wallet, transactions, e-wallet, digital wallet",
  });

  return meta;
};

export default WalletModule;
