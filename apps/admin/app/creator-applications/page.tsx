import { Header } from "@/components/header";
import { Application } from "@/modules";
import { useApplicationQuery } from "@/TestData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Creator Applications - mfoni admin",
  };

export default function CreatorApplications() {
    const {data, isDataLoading, error, } = useApplicationQuery()
    return (
        <>
            <Header />
            <div className="mt-12">
                <Application data={data} isDataLoading={isDataLoading} error={error} />
            </div>
        </>
    )
}