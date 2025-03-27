import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { jsonWithCache } from "@/lib/actions/json-with-cache.server.ts";
import { protectRouteLoader } from "@/lib/actions/protect-route-loader.ts";
import { getDisplayUrl, getDomainUrl } from "@/lib/misc.ts";
import { getSocialMetas } from "@/lib/seo.ts";
import { OnboardingModule } from "@/modules/index.ts";

export async function loader(loaderArgs: LoaderFunctionArgs) {
  const res = await protectRouteLoader(loaderArgs);
  if (res) return res;

  return jsonWithCache({
    origin: getDomainUrl(loaderArgs.request),
  });
}

export const meta: MetaFunction<any> = ({ data, location }) => {
  const meta = getSocialMetas({
    title: "Onboarding | mfoni",
    description: "What is your primary goal?",
    url: getDisplayUrl({
      origin: data?.origin ?? "https://mfoni.app",
      path: location.pathname,
    }),
    origin: data?.origin,
    keywords: "onboarding, goals, mfoni",
  });

  return meta;
};

export default OnboardingModule;
