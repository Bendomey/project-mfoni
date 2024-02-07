import {classNames} from '@/lib/classNames.ts'
import {CheckIcon} from '@heroicons/react/24/outline'

const tiers = [
  {
    name: 'Silver Snapshot Plan',
    id: 'tier-hobby',
    href: '#',
    priceMonthly: '$9.99',
    description:
      "The perfect plan if you're just getting started with our product.",
    features: [
      'Unlimited photo uploads',
      'Basic AI-powered image recognition',
      'Access to client management tools',
      'Monthly analytics report',
      'Standard customer support',
    ],
    featured: false,
  },
  {
    name: 'Platinum Portfolio Plan',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '$39.99',
    description:
      'Grow your photography business with premium support and exclusive opportunities.',
    features: [
      'All Golden Capture features',
      'Enhanced client engagement tools',
      'Premium analytics and insights',
      'Dedicated account manager',
      'Exclusive access to industry events and workshops',
    ],
    featured: true,
  },
  {
    name: 'Golden Capture Plan',
    id: 'tier-hobby',
    href: '#',
    priceMonthly: '$19.99',
    description:
      'Elevate your brand and streamline workflow with advanced features.',
    features: [
      'All Silver Snapshot features',
      'Advanced AI-powered image recognition',
      'Dedicated support representative',
      'Priority customer support',
      'Integration with popular photography tools',
    ],
    featured: false,
  },
]

export const Pricing = () => {
  return (
    <div
      id="pricing"
      className="relative isolate mt-32 bg-white px-6 sm:mt-56 lg:px-8"
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
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
        Qui iusto aut est earum eos quae. Eligendi est at nam aliquid ad quo
        reprehenderit in aliquid fugiat dolorum voluptatibus.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-none 2xl:max-w-7xl lg:grid-cols-3">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured
                ? 'relative bg-black shadow-2xl'
                : 'bg-white/60 sm:mx-8 lg:mx-0',
              tier.featured
                ? ''
                : tierIdx === 0
                  ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                  : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
              'rounded-3xl p-8 ring-1 ring-black/10 sm:p-10',
            )}
          >
            <h3
              id={tier.id}
              className={classNames(
                tier.featured ? 'text-blue-400' : 'text-blue-600',
                'text-base font-semibold leading-7',
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={classNames(
                  tier.featured ? 'text-white' : 'text-black',
                  'text-5xl font-bold tracking-tight',
                )}
              >
                {tier.priceMonthly}
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
            <ul
              className={classNames(
                tier.featured ? 'text-gray-300' : 'text-gray-600',
                'mt-8 space-y-3 text-sm leading-6 sm:mt-10',
              )}
            >
              {tier.features.map(feature => (
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
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-400 focus-visible:outline-blue-500'
                  : 'text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 focus-visible:outline-blue-600',
                'mt-8 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
              )}
            >
              Get started today
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
