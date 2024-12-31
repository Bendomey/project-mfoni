import { Header } from "@/components/header";
import { ListContents } from "@/modules";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contents - mfoni admin",
};

export default function Users() {
  return (
    <>
      <Header />
      <div className="mt-10">
        <ListContents />
      </div>
    </>
  );
}
