import { Header } from "@/components/header";
import ComingSoon from "@/modules/coming-soon";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users - mfoni admin",
  };

export default function Users() {
    return (
        <>
            <Header />

            <div className="mt-20">
                <ComingSoon />
            </div>
        </>
    )
}