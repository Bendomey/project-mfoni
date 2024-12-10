import { useMemo } from 'react'
import { classNames } from '@/lib/classNames.ts'
import {
  HeartIcon,
  PhotoIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/solid'
import { Link, useLocation, useNavigate } from '@remix-run/react'
import { PAGES } from '@/constants/index.ts'

export function Tabs() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = useMemo(() => [
    { name: 'Photos', href: PAGES.AUTHENTICATED_PAGES.ACCOUNT, current: PAGES.AUTHENTICATED_PAGES.ACCOUNT === location.pathname, icon: PhotoIcon },
    {
      name: 'Collections',
      href: PAGES.AUTHENTICATED_PAGES.ACCOUNT_COLLECTIONS,
      current: PAGES.AUTHENTICATED_PAGES.ACCOUNT_COLLECTIONS === location.pathname,
      icon: RectangleStackIcon,
    },
    { name: 'Likes', href: PAGES.AUTHENTICATED_PAGES.ACCOUNT_LIKES, current: PAGES.AUTHENTICATED_PAGES.ACCOUNT_LIKES === location.pathname, icon: HeartIcon },
  ], [location.pathname])

  const activeTab = tabs.find(tab => tab.current)?.name ?? 'Photos'

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          value={activeTab}
          onChange={e => {
            navigate(
              tabs.find(tab => tab.name === e.target.value)?.href ??
              PAGES.AUTHENTICATED_PAGES.ACCOUNT,
            )
          }}
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          {tabs.map(tab => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <Link
                prefetch="intent"
                key={tab.name}
                preventScrollReset={true}
                to={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'flex whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                )}
              >
                <div className="mr-1">
                  <tab.icon className={classNames("h-5 w-5 ",  tab.current ? 'text-blue-600' : 'text-gray-400')} />
                </div>
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
