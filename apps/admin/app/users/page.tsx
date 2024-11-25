import { Header } from "@/components/header";
import { ListUsers } from "@/modules";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users - mfoni admin",
};

export default function Users() {
  return (
    <>
      <Header />
      <div className="mt-12">
        <ListUsers />
      </div>
    </>
  );
}
