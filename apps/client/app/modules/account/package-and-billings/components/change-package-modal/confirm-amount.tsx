import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Link } from '@remix-run/react'
import { useMemo } from 'react'
import { MFONI_PACKAGES_DETAILED } from '@/constants/index.ts'
import dayjs from 'dayjs'
import { determineIfItsAnUpgradeOrDowngrade, isPackagePremium } from '@/lib/pricing-lib.ts'
import { usePackageAndBillingsContext } from '../../context/index.tsx'

interface Props {
    mfoniPackage: string
    isWalletLow: boolean
    period: number
    upgradeType: 'INSTANT' | 'DEFER'
    setUpgradeType: (value: 'INSTANT' | 'DEFER') => void
}

export function ConfirmAmount({ mfoniPackage, isWalletLow, period, setUpgradeType, upgradeType }: Props) {
    const { activePackage } = usePackageAndBillingsContext()

    const selectedPackage = useMemo(() => {
        return MFONI_PACKAGES_DETAILED[mfoniPackage as PackageType]
    }, [mfoniPackage]);

    const pricingChange = determineIfItsAnUpgradeOrDowngrade({
        activePackage: activePackage?.id as PackageType,
        changePackage: mfoniPackage as PackageType
    })


    return (
        <div>
            <h1 className="font-bold text-xl">2. Confirm Package</h1>
            <div className="">
                <p className="text-sm text-gray-600 mt-1">
                    Flexible pricing packages that grow with you.
                </p>

                <div className="mt-5">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-600 ">
                            Package:
                        </p>
                        <p className="text-base font-bold text-gray-900 ml-3">
                            {selectedPackage.name}
                        </p>

                    </div>

                    {
                        selectedPackage.amount > 0 ? (
                            <div className="flex items-center mt-2">
                            <p className="text-sm text-gray-600 ">
                                Period:
                            </p>
                            <p className="text-base font-bold text-gray-900 ml-3">
                                {period} month{period > 1 ? 's' : ''} <span className='text-xs text-gray-400 font-normal'>(monthly auto renewal{period > 1 ? 'after cycle' : ''})</span>
                            </p>
                        </div>
                        ) : null
                    }
                   

                    <div className="flex items-center mt-2">
                        <p className="text-sm text-gray-600 ">
                            Amount:
                        </p>
                        <p className="text-base font-bold text-gray-900 ml-3">
                            {formatAmount(convertPesewasToCedis(selectedPackage.amount * period))}
                        </p>
                    </div>

                    {
                        pricingChange === 'UPGRADE' && isPackagePremium(activePackage?.id as PackageType) && isPackagePremium(selectedPackage.id as PackageType) ? (
                            <div className='mt-3 bg-gray-50 p-3 border border-gray-300 rounded-md'>
                                <span className='text-sm'>What type of plan upgrade do you prefer?</span>
                                <div className='ml-5 mt-1'>
                                    <UpgradeForm setUpgradeType={setUpgradeType} upgradeType={upgradeType} />
                                </div>
                            </div>
                        ) : null
                    }

                    {
                        isWalletLow ? (
                            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mt-3">
                                <div className="flex">
                                    <div className="shrink-0">
                                        <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            You are low on your wallet balance.
                                            <Link to="/account/wallet" prefetch='intent' className="font-medium text-yellow-700 underline hover:text-yellow-600">
                                                Top up here
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    }
                </div>
            </div>
        </div>
    )
}

interface UpgradeFormProps {
    setUpgradeType: (value: 'INSTANT' | 'DEFER') => void
    upgradeType: 'INSTANT' | 'DEFER'
}

function UpgradeForm({ setUpgradeType, upgradeType }: UpgradeFormProps) {
    return (
        <fieldset>
            <legend className="sr-only">Instant</legend>
            <div className="space-y-1">
                <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                            <input
                                checked={upgradeType === 'INSTANT'}
                                onChange={() => setUpgradeType('INSTANT')}
                                id="upgrade-type"
                                name="upgrade-type"
                                value='INSTANT'
                                type="radio"
                                aria-describedby="upgrade-type-description"
                                className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                            />
                        </div>
                    </div>
                    <div className="text-sm/6">
                        <label htmlFor="comments" className="font-medium text-gray-900">
                            Instant
                        </label>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                            <input
                                checked={upgradeType === 'DEFER'}
                                onChange={() => setUpgradeType('DEFER')}
                                id="upgrade-type"
                                value='DEFER'
                                name="upgrade-type"
                                type="radio"
                                aria-describedby="upgrade-type-description"
                                className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                            />
                        </div>
                    </div>
                    <div className="text-sm/6">
                        <label htmlFor="candidates" className="font-medium text-gray-900">
                            Defer to next billing cycle <span className='text-blue-600'>({dayjs().format('ll')})</span>
                        </label>
                    </div>
                </div>
            </div>
        </fieldset>
    )
}
