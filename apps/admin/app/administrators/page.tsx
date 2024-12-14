import { Header } from "@/components/header";
import { ListAdmins } from "@/modules";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Administrators - mfoni admin",
  };

export default function Administrators() {
    return (
        <>
            <Header />

            <div className="mt-10">
                <ListAdmins />
            </div>
        </>
    )
}