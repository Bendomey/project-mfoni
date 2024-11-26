import { classNames } from "@/lib/classNames.ts"
import { WalletIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";


const people = [
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        email: 'lindsay.walton@example.com',
        role: 'Member',
    },
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        email: 'lindsay.walton@example.com',
        role: 'Member',
    },
    {
        name: 'Lindsay Walton',
        title: 'Front-end Developer',
        email: 'lindsay.walton@example.com',
        role: 'Member',
    },
    // More people...
]

export function WalletTransactionsTable() {

    return (
        <div className=" bg-white py-5 rounded-md border border-gray-200">
            <div className="sm:flex sm:items-center px-4 sm:px-6 lg:px-5">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-gray-900">Wallet transactions</h1>
                    <p className="mt-1 text-sm text-gray-700">
                        These are your wallet transactions that have happened in the past.
                    </p>
                </div>
            </div>
            <div className="mt-5 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="relative">
                            <table className="min-w-full table-fixed divide-y divide-gray-200 border-t border-gray-200">
                                <thead>
                                    <tr>
                                       
                                        <th scope="col" className="min-w-[12rem] py-3.5 px-7 sm:px-6 text-left text-xs font-semibold text-gray-900">
                                            Transaction
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                            Created On
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {people.map((person) => (
                                        <tr key={person.email}>
                                            <td
                                                className={classNames(
                                                    'whitespace-nowrap py-4 px-7 sm:px-6 text-sm font-medium flex items-center gap-1 text-gray-900',
                                                )}
                                            >
                                                <WalletIcon className="h-6 w-auto" />
                                                Order 6MRDD09HVD deposited
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                                    DEPOSIT
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">GH₵ 200.00</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{dayjs().format('ll')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
