import { Field, Label, Switch } from '@headlessui/react'
import { useCallback, useMemo } from 'react'
import { usePackageAndBillingsContext } from '../../context/index.tsx'
import { useGetMfoniPackages } from '@/api/mfoni-packages/index.ts'
import { useIsSubscriptionCancelled } from '@/api/subscriptions/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { useAuth } from '@/providers/auth/index.tsx'

interface Props {
	mfoniPackage?: MfoniPackage
	setMfoniPackage: (value?: MfoniPackage) => void
	annualBillingEnabled: boolean
	setAnnualBillingEnabled: (value: boolean) => void
}

export function SelectPackage({
	mfoniPackage,
	setMfoniPackage,
	annualBillingEnabled,
	setAnnualBillingEnabled,
}: Props) {
	const { activeSubcription } = useAuth()
	const { activePackage } = usePackageAndBillingsContext()
	const { data } = useIsSubscriptionCancelled(activeSubcription?.id)
	const { data: mfoniPackages } = useGetMfoniPackages({
		query: {
			pagination: { page: 0, per: 5 },
			filters: {
				status: 'MfoniPackage.Status.Active',
			},
			sorter: {
				sort: 'asc',
				sortBy: 'createdAt',
			},
		},
	})

	const plans = useMemo(() => {
		if (!mfoniPackages) return []

		return mfoniPackages.rows.map((pkg) => {
			return {
				name : pkg.name,
				priceMonthly: pkg.amount === 0 ? 'FREE' : formatAmount(convertPesewasToCedis(pkg.amount * 1)),
				priceYearly: pkg.amount === 0 ? 'FREE' : formatAmount(convertPesewasToCedis(pkg.amount * 12)),
				description: pkg.description,
				id: pkg.code,
				popular: pkg.code === 'MfoniPackage.Basic', // hardcoded for now
				base: pkg
			}
		});
	}, [mfoniPackages])

	const isPlanDisabled = useCallback(
		(packageId: string) => {
			let isDisabled = Boolean(activePackage && activePackage.code === packageId)

			// if the active package was cancelled(but hasn't expired yet), we should allow user it.
			if (data) {
				if (packageId === 'MfoniPackage.Free' || packageId === activePackage?.code) {
					isDisabled = true
				} else {
					isDisabled = false
				}
			}

			return isDisabled
		},
		[activePackage, data],
	)

	return (
		<div>
			<h1 className="text-xl font-bold">1. Choose a package</h1>
			<div className="">
				<p className="mt-1 text-sm text-gray-600">
					Flexible pricing packages that grow with you.
				</p>

				<div className="mt-5">
					<Field className="flex items-center">
						<Switch
							checked={annualBillingEnabled}
							onChange={setAnnualBillingEnabled}
							className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-[checked]:bg-blue-600"
						>
							<span
								aria-hidden="true"
								className="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
							/>
						</Switch>
						<Label as="span" className="ml-3 text-sm">
							<span className="font-medium text-gray-900">Annual billing</span>{' '}
							{/* <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10">
                                Save 10%
                            </span> */}
						</Label>
					</Field>
					<div className="mt-2">
						<fieldset
							aria-label="Pricing plans"
							className="relative rounded-md bg-white"
						>
							{plans.map((plan) => (
								<label
									key={plan.id}
									aria-label={plan.id}
									aria-disabled={isPlanDisabled(plan.id)}
									aria-description={`${plan.priceMonthly} per month, ${plan.priceYearly} per year, ${plan.description}`}
									className="group relative mb-3 flex cursor-pointer flex-col rounded-md border border-gray-200 p-4 focus:outline-none has-[:checked]:relative has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-gray-50 aria-disabled:opacity-50 md:grid md:grid-cols-2 md:pl-4 md:pr-6"
								>
									{plan.popular ? (
										<div className="absolute -top-3 left-5">
											<span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white ring-2 ring-white">
												POPULAR
											</span>
										</div>
									) : null}

									<span className="flex items-center gap-3 text-sm">
										<input
											value={mfoniPackage?.code}
											checked={mfoniPackage?.code === plan.id}
											onChange={() => setMfoniPackage(plan.base)}
											name="pricing-plan"
											type="radio"
											disabled={isPlanDisabled(plan.id)}
											className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
										/>
										<div>
											<span className="font-medium text-gray-900 group-has-[:checked]:text-blue-900">
												{plan.name}
											</span>
											<p className="text-sm text-gray-500 group-has-[:checked]:text-blue-700">
												{plan.description}
											</p>
										</div>
									</span>
									<span className="ml-6 mt-4 pl-1 text-sm md:ml-0 md:mt-0 md:pl-0 md:text-end">
										{plan.priceMonthly === 'FREE' ? (
											<span className="font-bold text-blue-900 group-has-[:checked]:text-blue-900">
												{plan.priceMonthly}
											</span>
										) : (
											<>
												<span
													className={classNames(
														'group-has-[:checked]:text-blue-900',
														annualBillingEnabled
															? 'text-gray-500'
															: 'font-bold text-gray-900',
													)}
												>
													{plan.priceMonthly} / mo
												</span>{' '}
												<span
													className={classNames(
														'group-has-[:checked]:text-blue-700',
														annualBillingEnabled
															? 'font-bold text-gray-900'
															: 'text-gray-500',
													)}
												>
													({plan.priceYearly} / yr)
												</span>
											</>
										)}
									</span>
								</label>
							))}
						</fieldset>
					</div>
				</div>
			</div>
		</div>
	)
}
