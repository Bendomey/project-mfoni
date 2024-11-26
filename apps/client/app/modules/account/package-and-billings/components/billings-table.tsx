import { Button } from "@/components/button/index.tsx";
import { classNames } from "@/lib/classNames.ts"
import { CheckIcon, DocumentTextIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";

import { useLayoutEffect, useRef, useState } from 'react'

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

export function BillingsTable() {
    const checkboxRef = useRef<HTMLInputElement>(null);
    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(false)
    const [selectedPeople, setSelectedPeople] = useState([])

    useLayoutEffect(() => {
        const isIndeterminate = selectedPeople.length > 0 && selectedPeople.length < people.length
        setChecked(selectedPeople.length === people.length)
        setIndeterminate(isIndeterminate)
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate
        }
    }, [selectedPeople])

    function toggleAll() {
        setSelectedPeople(checked || indeterminate ? [] : people)
        setChecked(!checked && !indeterminate)
        setIndeterminate(false)
    }

    return (
        <div className=" bg-white py-5 rounded-md border border-gray-200">
            <div className="sm:flex sm:items-center px-4 sm:px-6 lg:px-5">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold text-gray-900">Billing history</h1>
                    <p className="mt-1 text-sm text-gray-700">
                        Download your previous package reciepts and usage details
                    </p>
                </div>
                {/* <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Button>Download All</Button>
                </div> */}
            </div>
            <div className="mt-5 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="relative">
                            {selectedPeople.length > 0 ? (
                                <div className="absolute left-14 top-2.5 flex items-center space-x-3 bg-white sm:left-12">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                    >
                                        Bulk download
                                    </button>
                                </div>
                            ) : null}
                            <table className="min-w-full table-fixed divide-y divide-gray-200 border-t border-gray-200">
                                <thead>
                                    <tr>
                                        <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                                            <input
                                                type="checkbox"
                                                className="absolute left-4 top-1/2 -mt-2 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                                ref={checkboxRef}
                                                checked={checked}
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th scope="col" className="min-w-[12rem] py-3.5 pr-3 text-left text-xs font-semibold text-gray-900">
                                            Reciept
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                            Billing date
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                                            Package
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {people.map((person) => (
                                        <tr key={person.email} className={selectedPeople.includes(person) ? 'bg-gray-50' : undefined}>
                                            <td className="relative px-7 sm:w-12 sm:px-6">
                                                {selectedPeople.includes(person) ? (
                                                    <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-600" />
                                                ) : null}
                                                <input
                                                    type="checkbox"
                                                    className="absolute left-4 top-1/2 -mt-2 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                                    value={person.email}
                                                    checked={selectedPeople.includes(person)}
                                                    onChange={(e) =>
                                                        setSelectedPeople(
                                                            e.target.checked
                                                                ? [...selectedPeople, person]
                                                                : selectedPeople.filter((p) => p !== person),
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td
                                                className={classNames(
                                                    'whitespace-nowrap py-4 pr-3 text-sm font-medium flex items-center gap-1',
                                                    selectedPeople.includes(person) ? 'text-blue-600' : 'text-gray-900',
                                                )}
                                            >
                                                <DocumentTextIcon className="h-6 w-auto" />
                                                Receipt #001 - Dec 2024
                                                <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 ml-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
                                                    <CheckIcon className="h-3 w-auto" />
                                                    Paid
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Dec 10, 2024</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">GHS 200.00</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Snap & Share</td>
                                            <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3 flex">
                                                <Button variant='unstyled'>
                                                    <EllipsisVerticalIcon className="h-5 w-auto text-gray-600" />
                                                </Button>
                                            </td>
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
