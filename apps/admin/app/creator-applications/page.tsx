import { Header } from "@/components/header";
import ComingSoon from "@/modules/coming-soon";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Creator Applications - mfoni admin",
  };

export default function CreatorApplications() {
    return (
        <>
            <Header />

            <div className="mt-20">
                <ComingSoon />
            </div>
        </>
    )
}