import { Header } from "@/components/header";
import { ListCollections } from "@/modules";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections - mfoni admin",
};

export default function Users() {
  return (
    <>
      <Header />
      <div className="mt-10">
        <ListCollections />
      </div>
    </>
  );
}
