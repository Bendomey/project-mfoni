import { Header } from "@/components/header";
import ComingSoon from "@/modules/coming-soon";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings - mfoni admin",
  };

export default function Settings() {
    return (
        <>
            <Header />

            <div className="mt-20">
                <ComingSoon />
            </div>
        </>
    )
}