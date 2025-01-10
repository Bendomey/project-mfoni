import { Header } from "@/components/header";
import { ListTags } from "@/modules";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags - mfoni admin",
};

export default function Users() {
  return (
    <>
      <Header />
      <div className="mt-10">
        <ListTags />
      </div>
    </>
  );
}
