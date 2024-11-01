import { Header } from "@/components/header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Overview - mfoni admin",
};

export default function Home() {
  return (
    <>
      <Header />
      <div className="px-7 mt-8">
        <div className="mb-2">
          <h1 className="font-extrabold text-3xl">Dashboard</h1>
        </div>

        <Tabs defaultValue="overview" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger disabled value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
          overview
          </TabsContent>
          <TabsContent value="analytics">
          analytics
          </TabsContent>
          <TabsContent value="notifications">
          notifications
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
