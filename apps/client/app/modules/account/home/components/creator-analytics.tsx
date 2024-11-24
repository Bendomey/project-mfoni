import {classNames} from '@/lib/classNames.ts'
import {ArrowDownIcon, ArrowUpIcon} from '@heroicons/react/20/solid'
import { Link } from '@remix-run/react'

const stats = [
  {
    name: 'Followers',
    stat: '71,897',
    previousStat: '70,946',
    change: '12%',
    changeType: 'increase',
    href: '/account/followers',
  },
  {
    name: 'My Wallet',
    stat: 'GHS 1,200.00',
    previousStat: '56.14%',
    change: '2.02%',
    changeType: 'increase',
    href: '/account/wallet',
  },
  {
    name: 'Active Package',
    stat: 'Snap & Share',
    href: '/account/package-and-billings',
  },
]
export const CreatorAnalytics = () => {
  return (
    <div className="">
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Your Analytics
        </h3>
        <h3 className="text-xs font-light leading-6 text-gray-900 -mt-1">
          This section is private to you
        </h3>
        <dl className="mt-2 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map(item => (
            <Link to={item.href} key={item.name} className="px-4 py-5 sm:p-6 hover:bg-gray-50">
              <dt className="text-base font-normal text-gray-900">
                {item.name}
              </dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-bold text-blue-600">
                  {item.stat}
                </div>

                {
                  item.change ? (
                    <div
                    className={classNames(
                      item.changeType === 'increase'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                      'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0',
                    )}
                  >
                    {item.changeType === 'increase' ? (
                      <ArrowUpIcon
                        aria-hidden="true"
                        className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                      />
                    ) : (
                      <ArrowDownIcon
                        aria-hidden="true"
                        className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
                      />
                    )}
  
                    <span className="sr-only">
                      {' '}
                      {item.changeType === 'increase'
                        ? 'Increased'
                        : 'Decreased'}{' '}
                      by{' '}
                    </span>
                    {item.change}
                  </div>
                  ) : null
                }
               
              </dd>
            </Link>
          ))}
        </dl>
      </div>
    </div>
  )
}
