import { Header } from "@/components/header";
import ComingSoon from "@/modules/coming-soon";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Administrators - mfoni admin",
  };

export default function Administrators() {
    return (
        <>
            <Header />

            <div className="mt-20">
                <ComingSoon />
            </div>
        </>
    )
}