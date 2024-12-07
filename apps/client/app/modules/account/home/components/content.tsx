import {imageUrls} from '@/modules/index.ts'
import {Fragment} from 'react'
import {Content} from '@/components/Content/index.tsx'
import {classNames} from '@/lib/classNames.ts'
import {
  HeartIcon,
  PhotoIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/solid'
import {Link} from '@remix-run/react'

export function Contents() {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Your Contents
        </h3>
        <div className="mt-1">
          <Tabs />
        </div>
      </div>
      <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8 ">
        {imageUrls.map((url, index) => (
          <Fragment key={index}>
            <Content content={{media: url} as any} />
          </Fragment>
        ))}
      </div>
    </div>
  )
}

const tabs = [
  {name: 'All', href: '#', count: '52', current: true, icon: PhotoIcon},
  {
    name: 'Collections',
    href: '#',
    count: '6',
    current: false,
    icon: RectangleStackIcon,
  },
  {name: 'Likes', href: '#', count: '4', current: false, icon: HeartIcon},
]

function Tabs() {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
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
                to="#"
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'flex whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                )}
              >
                <div className="mr-1">
                  <tab.icon className="h-5 w-5 text-gray-400" />
                </div>
                {tab.name}
                {tab.count ? (
                  <span
                    className={classNames(
                      tab.current
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-900',
                      'ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block',
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
