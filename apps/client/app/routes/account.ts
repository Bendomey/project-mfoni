import { type MetaFunction } from "@remix-run/node";
import { protectRouteLoader } from "@/lib/actions/protect-route-loader.ts";
import { AccountModule } from "@/modules/index.ts";

export const meta: MetaFunction = () => {
  return [
    { title: "My Account | mfoni" },
    { name: "description", content: "Welcome to mfoni!" },
    { name: "keywords", content: "mfoni" },
  ];
};
export const loader = protectRouteLoader;

export default AccountModule;
