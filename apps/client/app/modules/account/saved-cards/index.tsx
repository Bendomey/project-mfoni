import { Popover } from '@headlessui/react';
import { ChevronLeftIcon, ExclamationCircleIcon, CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { CheckBadgeIcon, TrashIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { AddCardButton } from './components/add-card/index.tsx';
import { PrimaryCardCard } from './components/primary-card-card.tsx';
import { RemoveCardButton } from './components/remove-card/index.tsx';
import { useGetSavedCards } from '@/api/saved-cards/index.ts';
import mastercardLogo from '@/assets/mastercard-icon.png'
import visaLogo from '@/assets/visa-icon.png'
import { Button } from "@/components/button/index.tsx";
import { FlyoutContainer } from '@/components/flyout/flyout-container.tsx';
import { Footer } from "@/components/footer/index.tsx";
import { Header } from "@/components/layout/index.ts";
import { Loader } from '@/components/loader/index.tsx';
import { classNames } from '@/lib/classNames.ts';
import { toFirstUpperCase } from '@/lib/strings.ts';

export const SavedCardsModule = () => {
    const { data, isError, isLoading } = useGetSavedCards({
        pagination: {
            page: 0,
            per: 50,
        },
    })

    let content = <></>

    if (isLoading) {
        content = (
            <>
                <h3 className='font-bold text-gray-500 uppercase mb-2 text-xs'>Primary</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className='col-span-2 border p-4 rounded-md h-44 bg-gray-100 animate-pulse' />
                </div>

                <div className="mt-10">

                    <div className="rounded-md border border-gray-200 bg-white pb-1 pt-5">
                        <div className="px-4 sm:flex sm:items-center sm:px-6 lg:px-5">
                            <div className="sm:flex-auto">
                                <h1 className="text-base font-semibold text-gray-900">
                                    Secondary Cards
                                </h1>
                                <p className="mt-1 text-sm text-gray-700">
                                    When the primary card fails, a secondary card pays the balance automatically.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <div className="relative">
                                        <div className="mx-4 space-y-3">
                                            {[1, 2, 3, 4, 5].map((_, index) => (
                                                <div
                                                    className="flex w-full items-center justify-between bg-gray-50 p-2"
                                                    key={index}
                                                >
                                                    <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200" />
                                                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                                                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                                                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                                                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    } else if (isError) {
        content = (
            <div className="py-20 text-center">
                <ExclamationCircleIcon className="mx-auto h-12 w-auto text-red-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Cards failed to fetch.
                </h3>
                <p className="mt-1 px-10 text-sm text-gray-500">Try again later.</p>
                <div className='mt-4'>
                    <Button size='md' onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    } else if (data) {
        const primaryCard = data.rows.find(card => card.defaultedAt !== null);
        const secondaryCards = data.rows.filter(card => card.defaultedAt === null);

        content = (
            <>
                <h3 className='font-bold text-gray-500 uppercase mb-2 text-xs'>Primary</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className='col-span-2'>
                        <PrimaryCardCard savedCard={primaryCard} showRemoveButton={primaryCard && !secondaryCards.length} />
                    </div>
                </div>

                {
                    data.rows.length ? (
                        <div className="mt-10">

                            <div className="rounded-md border border-gray-200 bg-white pb-1 pt-5">
                                <div className="px-4 sm:flex sm:items-center sm:px-6 lg:px-5">
                                    <div className="sm:flex-auto">
                                        <h1 className="text-base font-semibold text-gray-900">
                                            Secondary Cards
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-700">
                                            When the primary card fails, a secondary card pays the balance automatically.
                                        </p>
                                    </div>
                                    <div>
                                        <AddCardButton>
                                            {({ onClick }) => (
                                                <Button onClick={onClick} size='sm' className="mt-3 sm:mt-0 sm:ml-3">
                                                    Add New Card
                                                </Button>
                                            )}
                                        </AddCardButton>
                                    </div>
                                </div>
                                <div className="mt-5 flow-root">
                                    {
                                        secondaryCards.length ? (
                                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                                    <div className="relative">
                                                        <table className="min-w-full table-fixed divide-y divide-gray-200 border-t border-gray-200">
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        scope="col"
                                                                        className="min-w-[12rem] px-7 py-3.5 text-left text-xs font-semibold text-gray-900 sm:px-6"
                                                                    >
                                                                        Account Details
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
                                                                    >
                                                                        Expiry
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
                                                                    >
                                                                        Status
                                                                    </th>
                                                                    <th
                                                                        scope="col"
                                                                        className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900"
                                                                    >
                                                                        Created On
                                                                    </th>
                                                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                                                        <span className="sr-only">Actions</span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                {secondaryCards.length ? (
                                                                    <>
                                                                        {secondaryCards.map((savedCard) => (
                                                                            <tr key={savedCard.id}>
                                                                                <td
                                                                                    className={classNames(
                                                                                        'flex items-center gap-1 whitespace-nowrap px-7 py-4 text-sm font-medium text-gray-900 sm:px-6',
                                                                                    )}
                                                                                >
                                                                                    <div className='flex flex-row items-center gap-1'>
                                                                                        {
                                                                                            savedCard.reusable ? null : (
                                                                                                <div>
                                                                                                    <Popover>
                                                                                                        {({ open }) => (
                                                                                                            <div
                                                                                                                className="relative inline-block"
                                                                                                                onMouseEnter={(e) => {
                                                                                                                    if (!open) e?.currentTarget?.querySelector("button")?.click();
                                                                                                                }}
                                                                                                                onMouseLeave={(e) => {
                                                                                                                    if (open) e?.currentTarget?.querySelector("button")?.click();
                                                                                                                }}
                                                                                                            >
                                                                                                                <Popover.Button>
                                                                                                                    <ExclamationTriangleIcon className='text-yellow-600 h-5 w-auto' />
                                                                                                                </Popover.Button>

                                                                                                                <Popover.Panel className="absolute -top-16 z-10 mt-2 w-72 rounded-lg bg-red-600 text-white shadow-lg ring-1 ring-black/5">
                                                                                                                    <div className="p-4">
                                                                                                                        <p className="text-sm">This card can't be used for payments.</p>
                                                                                                                    </div>
                                                                                                                </Popover.Panel>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </Popover>
                                                                                                </div>
                                                                                            )
                                                                                        }

                                                                                        <div className='mx-2 flex flex-row items-center gap-3'>
                                                                                            {
                                                                                                savedCard.cardType.toLowerCase().trim() === 'visa' ? (
                                                                                                    <img src={visaLogo} alt="Visa" className="h-10 w-auto" />
                                                                                                ) : savedCard.cardType.toLowerCase().trim() === 'mastercard' ? (
                                                                                                    <img src={mastercardLogo} alt="Mastercard" className="h-10 w-auto" />
                                                                                                ) : (
                                                                                                    <CreditCardIcon className="h-10 w-auto text-blue-800" />
                                                                                                )
                                                                                            }
                                                                                            <div className='flex flex-col'>
                                                                                                <span>{toFirstUpperCase(savedCard.cardType)} *****{savedCard.last4}</span>
                                                                                                <span className='text-sm text-gray-500'>{toFirstUpperCase(savedCard?.accountName ?? savedCard.bank)}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>


                                                                                </td>
                                                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                                    {savedCard.expiryMonth}/{savedCard.expiryYear}
                                                                                </td>
                                                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                                    {getStatus(savedCard.status)}
                                                                                </td>
                                                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                                    {dayjs(savedCard.createdAt).format('L')}
                                                                                </td>
                                                                                <td className="flex items-start gap-2 text-sm font-medium sm:pr-3">
                                                                                    <FlyoutContainer
                                                                                        intendedPosition="y"
                                                                                        FlyoutContent={
                                                                                            <div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-red-600 px-3 py-4 shadow-xl">
                                                                                                <h3 className="text-center text-sm font-bold text-white">
                                                                                                    Delete Card
                                                                                                </h3>
                                                                                            </div>
                                                                                        }
                                                                                    >
                                                                                        <RemoveCardButton savedCard={savedCard}>
                                                                                            {({ onClick }) => (
                                                                                                <Button
                                                                                                    onClick={onClick}
                                                                                                    color='dangerGhost'
                                                                                                    title="Remove Card"
                                                                                                    className=""
                                                                                                >
                                                                                                    <TrashIcon className="h-4 w-auto text-red-600" />
                                                                                                </Button>
                                                                                            )}
                                                                                        </RemoveCardButton>
                                                                                    </FlyoutContainer>
                                                                                    {savedCard.reusable && savedCard.status === 'SavedCard.Status.Active' ? (
                                                                                        <FlyoutContainer
                                                                                            intendedPosition="y"
                                                                                            FlyoutContent={
                                                                                                <div className="z-50 flex w-48 flex-col items-center justify-center rounded-2xl bg-blue-600 px-3 py-4 shadow-xl">
                                                                                                    <h3 className="text-center text-sm font-bold text-white">
                                                                                                        Make Primary
                                                                                                    </h3>
                                                                                                </div>
                                                                                            }
                                                                                        >
                                                                                            <Button
                                                                                                // onClick={onClick}
                                                                                                disabled={isLoading}
                                                                                                color='successGhost'
                                                                                                title="Make Card Primary"
                                                                                                className=""
                                                                                            >
                                                                                                {isLoading ? (
                                                                                                    <Loader size="5" />
                                                                                                ) : (
                                                                                                    <CheckBadgeIcon className="h-4 w-auto text-green-600" />
                                                                                                )}
                                                                                            </Button>
                                                                                        </FlyoutContainer>
                                                                                    ) : null}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </>
                                                                ) : null}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center space-y-2">
                                                <CreditCardIcon className="mx-auto h-12 w-auto text-gray-400" />
                                                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                                    No secondary cards found.
                                                </h3>
                                                <p className="px-10 text-sm text-gray-500">
                                                    Add a secondary card to ensure uninterrupted payments.
                                                </p>
                                                <AddCardButton>
                                                    {({ onClick }) => (
                                                        <Button onClick={onClick}>Add Card</Button>
                                                    )}
                                                </AddCardButton>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div >
                    ) : null
                }

            </>
        );
    }

    return (
        <>
            <Header isHeroSearchInVisible={false} />
            <div className="bg-gray-50 px-4 py-10 lg:px-20">
                <div className="mb-10">
                    <Button isLink href="/account" variant="unstyled" className="mb-2">
                        <ChevronLeftIcon className="h-4 w-auto" />
                        My Account
                    </Button>
                    <h1 className="font-shantell text-3xl font-semibold md:text-4xl">
                        Saved Cards {data?.total ? `(${data.total})` : ''}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage all your saved cards.
                    </p>
                </div>
                {content}
            </div>
            <Footer />
        </>
    );
}

function getStatus(status: SavedCard['status']) {
    switch (status) {
        case 'SavedCard.Status.Active':
            return (
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                    Active
                </span>
            )
        case 'SavedCard.Status.Inactive':
            return (
                <span className="bg-organge-50 text-organge-700 ring-organge-700/10 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
                    Inactive
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
                    Unknown
                </span>
            )
    }
}
