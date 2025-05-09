import { CheckIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/button/index.tsx'
import { PAGES } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'
import { convertPesewasToCedis, formatAmount } from '@/lib/format-amount.ts'
import { useAuth } from '@/providers/auth/index.tsx'

const tiers = [
	{
		name: 'Snap & Share',
		id: 'FREE',
		priceMonthly: 0,
		description:
			"The perfect plan if you're just getting started with our product.",
		features: [
			'Upload up to 50 images per month',
			'All uploaded images are free for users',
			'Basic one-page portfolio site',
			'Share profile and content',
			'Show up to 10 free images on your portfolio',
		],
		featured: false,
	},
	{
		name: 'Pro Lens',
		id: 'BASIC',
		priceMonthly: 5000,
		description:
			'Grow your photography business with premium support and exclusive opportunities.',
		features: [
			'Upload up to 200 images per month',
			'Option to price images',
			'Enhanced one-page portfolio site with customisation options',
			'Add contact info and social media links',
			' Track earnings with basic analytics',
			'Manual or automatic withdrawal of up to 2,000 GHS per month',
		],
		featured: true,
	},
	{
		name: 'Master Shot',
		id: 'ADVANCED',
		priceMonthly: 10000,
		description:
			'Elevate your brand and streamline workflow with advanced features.',
		features: [
			'Unlimited image uploads',
			'Full pricing control on all images',
			'Multi-page portfolio site with advanced customisation',
			'Priority for landing page features',
			'Advanced earnings analytics and insights',
			'Unlimited manual or automatic withdrawals',
			'Priority advertising on mfoni platform',
			'Early access to new features',
		],
		featured: false,
	},
]

export const Pricing = () => {
	const { currentUser } = useAuth()
	return (
		<div
			id="pricing"
			className="relative isolate mt-32 bg-white px-3 md:px-6 lg:mt-40 lg:px-8 2xl:mt-56"
		>
			<div
				className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
				aria-hidden="true"
			>
				<div
					className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#60a5fa] opacity-30"
					style={{
						clipPath:
							'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
					}}
				/>
			</div>
			<div className="mx-auto max-w-3xl text-center lg:max-w-7xl">
				<h2 className="text-base font-semibold leading-7 text-blue-600">
					Pricing
				</h2>
				<p className="mt-2 text-4xl font-bold tracking-tight text-black sm:text-5xl">
					The right price for you, whoever you are
				</p>
			</div>
			<div className="items-flex-start mx-auto mt-16 grid max-w-lg grid-cols-1 gap-x-5 gap-y-6 sm:mt-20 sm:gap-y-7 lg:max-w-none lg:grid-cols-3 2xl:max-w-7xl">
				{tiers.map((tier, tierIdx) => (
					<div
						key={tierIdx}
						className={classNames(
							tier.featured
								? 'relative bg-black shadow-2xl'
								: 'bg-white/60 sm:mx-8 lg:mx-0',
							tier.featured
								? ''
								: tierIdx === 0
									? 'rounded-t-3xl lg:rounded-bl-3xl'
									: 'lg:rounded-tr-3xl',
							'rounded-3xl p-8 ring-1 ring-black/10 sm:p-10',
						)}
					>
						<h3
							id={tier.id}
							className={classNames(
								tier.featured ? 'text-blue-400' : 'text-blue-600',
								'font-shantell text-3xl font-semibold leading-7',
							)}
						>
							{tier.name}
						</h3>
						<p className="mt-4 flex items-baseline gap-x-2">
							<span
								className={classNames(
									tier.featured ? 'text-white' : 'text-black',
									'text-3xl font-bold tracking-tight',
								)}
							>
								{formatAmount(convertPesewasToCedis(tier.priceMonthly))}
							</span>
							<span
								className={classNames(
									tier.featured ? 'text-gray-400' : 'text-gray-500',
									'text-base',
								)}
							>
								/month
							</span>
						</p>
						<p
							className={classNames(
								tier.featured ? 'text-gray-300' : 'text-gray-600',
								'mt-6 text-base leading-7',
							)}
						>
							{tier.description}
						</p>

						<Button
							isLink
							href={
								currentUser && currentUser.role == 'CREATOR'
									? `${PAGES.AUTHENTICATED_PAGES.PACKAGE_AND_BILLINGS}?change-package=${tier.id}`
									: `${PAGES.AUTHENTICATED_PAGES.ACCOUNT}?complete-creator-application=${tier.id}`
							}
							disabled={
								currentUser?.creator?.subscription.packageType === tier.id
							}
							aria-describedby={tier.id}
							className="mt-8 w-full"
							variant={tier.featured ? 'solid' : 'outlined'}
						>
							{currentUser
								? currentUser.role === 'CLIENT'
									? 'Apply'
									: currentUser.creator?.subscription.packageType === tier.id
										? 'Active'
										: 'Select'
								: 'Get started today'}
						</Button>

						<ul
							className={classNames(
								tier.featured ? 'text-gray-300' : 'text-gray-600',
								'mt-8 space-y-3 text-sm leading-6 sm:mt-10',
							)}
						>
							{tier.features.map((feature) => (
								<li key={feature} className="flex gap-x-3">
									<CheckIcon
										className={classNames(
											tier.featured ? 'text-blue-400' : 'text-blue-600',
											'h-6 w-5 flex-none',
										)}
										aria-hidden="true"
									/>
									{feature}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	)
}
