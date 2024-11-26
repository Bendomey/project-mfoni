import { Button } from "@/components/button/index.tsx";


export function WalletCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-lg ">
            <div className="p-5">

                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 w-2/3">
                        <div className="flex items-center gap-3">
                            <div className="border border-gray-200 px-2 rounded-md">
                                <span className="text-xs font-bold text-blue-600">MFONI</span>
                            </div>
                            <h1 className="font-bold text-sm">My Wallet</h1>
                        </div>
                        <p className="text-xs text-gray-500">This wallet is your default payment method for all purchases on this website.</p>
                    </div>
                    <div className="hidden md:flex items-end gap-1">
                        <h1 className="font-bold text-3xl">₵500.00</h1>
                    </div>
                </div>

            </div>

            <div className="border-t border-gray-200 px-4 py-2 flex justify-end gap-2 mt-3">
                <Button variant='outlined' className="gap-1">
                    Deposit
                </Button>

                <Button className="gap-1">
                    Withdraw
                </Button>
            </div>
        </div>
    )
}