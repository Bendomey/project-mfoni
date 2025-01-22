"use client";
import { Button } from "@/components/ui/button";
import { useGetWallet } from "@/api";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { convertPesewasToCedis, formatAmount } from "@/lib";

export const Wallet = () => {
  const { data, isPending: isDataLoading, refetch, error } = useGetWallet();

  return (
    <>
      {isDataLoading ? (
        <div className="flex items-center space-x-4 pb-5 h-36">
          <Skeleton className="h-20 w-44 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[230px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <>
          {data ? (
            <Card className="w-full dark:border-gray-600">
              <CardContent className="flex flex-col items-center justify-between gap-2 md:flex-row pt-4">
                <div>
                  <div className="flex flex-row justify-start items-center gap-4 pb-3">
                    <div className="rounded-md border border-gray-200 dark:border-gray-500 px-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-500">
                        MFONI
                      </span>
                    </div>
                    <h1 className="text-sm font-bold">My Wallet</h1>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    This wallet is your default payment method for all purchases
                    on this website.
                  </p>
                </div>

                <div className="flex items-end gap-1 pl-3">
                  <h1 className="text-3xl font-bold">{formatAmount(convertPesewasToCedis(data.wallet))}</h1>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 py-2 px-3 border-t border-gray-200 dark:border-gray-600">
                <Button variant="outline">Deposit</Button>
                <Button className="bg-blue-600 hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Withdraw
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div
              className={`flex flex-col justify-center items-center border rounded h-36 w-full `}
            >
              <p className="text-gray-500 dark:text-gray-400">
                Unable to load wallet
              </p>
              {refetch && (
                <Button
                  onClick={() => refetch()}
                  className="mt-4 mx-auto bg-blue-600 hover:bg-blue-800"
                >
                  Retry
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};
