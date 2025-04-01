import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { WalletTransactionsTable } from "./components/transactions-table.tsx";
import { WalletCard } from "./components/wallet-card.tsx";
import { useGetWalletTransactions } from "@/api/wallet-transactions/index.ts";
import { Button } from "@/components/button/index.tsx";
import { Footer } from "@/components/footer/index.tsx";
import { Header } from "@/components/layout/index.ts";

const WalletPage = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") ?? "0";
  const { data, isError, isLoading } = useGetWalletTransactions({
    pagination: {
      page: Number(page),
      per: 10,
    },
  });

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="bg-gray-50 px-4 py-10 lg:px-20">
        <div className="mb-10">
          <Button isLink href="/account" variant="unstyled" className="mb-2">
            <ChevronLeftIcon className="h-4 w-auto" />
            My Account
          </Button>
          <h1 className="text-2xl md:text-4xl font-semibold font-shantell">
            My Wallet
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage my wallet and transaction details.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <WalletCard />
        </div>

        <div className="mt-10">
          <WalletTransactionsTable
            data={data}
            isError={isError}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};
export const WalletModule = () => {
  const loaderData = useLoaderData<{
    dehydratedState: DehydratedState;
  }>();

  return (
    <HydrationBoundary state={loaderData.dehydratedState}>
      <WalletPage />
    </HydrationBoundary>
  );
};
