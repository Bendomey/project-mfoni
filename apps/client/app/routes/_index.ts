import { type MetaFunction } from "@remix-run/node";
import { LandingPageModule } from "@/modules/index.tsx";


export const meta: MetaFunction = () => {
  return [
    { title: "Home | ProjectMfoni" },
    { name: "description", content: "Welcome to ProjectMfoni!" },
    { name: "keywords", content: "ProjectMfoni, Mfoni"}
  ];
};

export default LandingPageModule