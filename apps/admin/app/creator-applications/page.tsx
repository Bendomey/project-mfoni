import { Header } from "@/components/header";
import { CreatorApplication } from "@/modules";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Applications - mfoni admin",
};

export default function CreatorApplications() {
  return (
    <>
      <Header />
      <div className="mt-10">
        <CreatorApplication />
      </div>
    </>
  );
}
