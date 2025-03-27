import {
  type MetaFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { environmentVariables } from "@/lib/actions/env.server.ts";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { protectRouteLoader } from "@/lib/actions/protect-route-loader.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import styles from "@/modules/account/verify/components/verify-phone-step/pin-code.css?url";
import { VerifyAccountModule } from "@/modules/index.ts";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs);
  if (!res) {
    return jsonWithCache({
      METRIC_CLIENT_ID: environmentVariables().METRIC_CLIENT_ID,
      METRIC_CLIENT_SECRET: environmentVariables().METRIC_CLIENT_SECRET,
      origin: getDomainUrl(loaderArgs.request),
    });
  }

  return res;
}

export const meta: MetaFunction<any> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "Verify Account | mfoni",
    description: "Secure your account by verifying your phone number and email",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
  });

  return meta;
};

export default VerifyAccountModule;
