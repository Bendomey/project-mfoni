import {classNames} from '@/lib/classNames.ts'
import {
  GifIcon,
  HashtagIcon,
  HomeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline'
import {useState} from 'react'

export const categories = [
  {name: 'All', href: '#', icon: HomeIcon, count: '25,000'},
  {
    name: 'Trending Events',
    href: '#',
    icon: HashtagIcon,
    count: '12,000',
  },
  {
    name: 'Detty December',
    href: '#',
    icon: RocketLaunchIcon,
    count: '',
  },
  {
    name: 'Outmostphere',
    href: '#',
    icon: SparklesIcon,
    count: '1,000',
  },
  {
    name: 'Weddings',
    href: '#',
    icon: GifIcon,
    count: '100',
  },
  {
    name: 'Gaming',
    href: '#',
    icon: VideoCameraIcon,
    count: '10',
  },
]

export const WebTabComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  return (
    <nav className="hidden lg:flex flex-1 flex-col" aria-label="Sidebar">
      <ul className="-mx-2 space-y-2">
        {categories.map(item => (
          <button
            onClick={() => setSelectedCategory(item)}
            type="button"
            className="w-full focus:outline-none"
            key={item.name}
          >
            <a
              href={item.href}
              className={classNames(
                item === selectedCategory
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 font-normal',
                'group flex gap-x-3 rounded-md p-3 text-sm leading-6 ',
              )}
            >
              <item.icon
                className={classNames(
                  item === selectedCategory
                    ? 'text-gray-900'
                    : 'text-gray-800 group-hover:text-gray-800',
                  'h-6 w-6 shrink-0',
                )}
                aria-hidden="true"
              />
              {item.name}
              {item.count ? (
                <span
                  className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
                  aria-hidden="true"
                >
                  {item.count}
                </span>
              ) : null}
            </a>
          </button>
        ))}
      </ul>
    </nav>
  )
}
