import {Header} from '@/components/layout/index.ts'
import {classNames} from '@/lib/classNames.ts'
import {AccountCover} from './components/cover.tsx'

const tabs = [
  {name: 'About', href: '#', current: true},
  {name: 'Muse', href: '#', current: false},
  {name: 'Contact', href: '#', current: false},
]

export const AccountModule = () => {
  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <article>
        {/* Profile header */}
        <AccountCover />

        {/* Tabs */}
        <div className="mt-6 sm:mt-2 2xl:mt-5">
          <div className="border-b border-gray-200">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                  <a
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      tab.current
                        ? 'border-pink-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                    )}
                    aria-current={tab.current ? 'page' : undefined}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Description list */}
        <div className="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            hello world
          </dl>
        </div>
      </article>
    </>
  )
}
