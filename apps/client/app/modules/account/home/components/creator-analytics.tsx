import {classNames} from '@/lib/classNames.ts'
import {convertPesewasToCedis, formatAmount} from '@/lib/format-amount.ts'
import {useAuth} from '@/providers/auth/index.tsx'
import {ArrowDownIcon, ArrowUpIcon} from '@heroicons/react/20/solid'
import {Link} from '@remix-run/react'
import dayjs from 'dayjs'
import {useMemo} from 'react'

export const CreatorAnalytics = () => {
  const {currentUser} = useAuth()

  const stats = useMemo(() => {
    const initStats: any = [
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
        stat: formatAmount(convertPesewasToCedis(currentUser?.wallet ?? 0)),
        previousStat: '56.14%',
        change: '2.02%',
        changeType: 'increase',
        href: '/account/wallet',
      },
    ]

    if (currentUser?.role === 'CREATOR' && currentUser.creator) {
      const startedAt = currentUser.creator.subscription.startedAt
      const endedAt = currentUser.creator.subscription.endedAt
      const isActive = endedAt
        ? dayjs().isAfter(startedAt) && dayjs().isBefore(endedAt)
        : dayjs().isAfter(startedAt)

      initStats.push({
        name: 'My Subscription',
        stat: isActive ? 'Active' : 'Needs Setup',
        href: '/account/package-and-billings',
      })
    }

    return initStats
  }, [currentUser])

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
          {stats.map((item: any) => (
            <Link
              to={item.href}
              key={item.name}
              className="px-4 py-5 sm:p-6 hover:bg-gray-50"
            >
              <dt className="text-base font-normal text-gray-900">
                {item.name}
              </dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-bold text-blue-600">
                  <span className="truncate">{item.stat}</span>
                </div>

                {item.change ? (
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
                ) : null}
              </dd>
            </Link>
          ))}
        </dl>
      </div>
    </div>
  )
}
