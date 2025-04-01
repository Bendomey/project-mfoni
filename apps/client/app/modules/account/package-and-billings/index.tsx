import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useLoaderData } from "@remix-run/react";
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { BillingsTable } from "./components/billings-table.tsx";
import { ChangePackageModal } from "./components/change-package-modal/index.tsx";
import { PackageCard } from "./components/package-card.tsx";
import { PaymentMethodCard } from "./components/payment-method-card.tsx";
import {
  PackageAndBillingsProvider,
  usePackageAndBillingsContext,
} from "./context/index.tsx";
import { Button } from "@/components/button/index.tsx";
import { Footer } from "@/components/footer/index.tsx";
import { Header } from "@/components/layout/index.ts";

const PackageAndBillingsPage = () => {
  const { isChangePackageModalOpened } = usePackageAndBillingsContext();

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="bg-gray-50 px-4 py-10 lg:px-20">
        <div className="mb-10">
          <Button isLink href="/account" variant="unstyled" className="mb-2">
            <ChevronLeftIcon className="h-4 w-auto" />
            My Account
          </Button>
          <h1 className="text-2xl md:text-3xl font-semibold font-shantell">
            Package and billings
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your package and billing details.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
          <div className="col-span-4">
            <PackageCard />
          </div>
          <div className="col-span-3">
            <PaymentMethodCard />
          </div>
        </div>

        <div className="mt-10">
          <BillingsTable />
        </div>
      </div>
      <Footer />
      <ChangePackageModal isOpened={isChangePackageModalOpened} />
    </>
  );
};

export const PackageAndBillingsModule = () => {
  const loaderData = useLoaderData<{
    dehydratedState: DehydratedState;
  }>();

  return (
    <HydrationBoundary state={loaderData.dehydratedState}>
      <PackageAndBillingsProvider>
        <PackageAndBillingsPage />
      </PackageAndBillingsProvider>
    </HydrationBoundary>
  );
};
