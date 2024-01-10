import {Header} from '@/components/layout/index.ts'
import {classNames} from '@/lib/classNames.ts'
import {AccountCover} from './components/cover.tsx'
import {FadeIn, FadeInStagger} from '@/components/animation/FadeIn.tsx'
import {Fragment} from 'react'
import {Content} from '@/components/Content/index.tsx'
import {imageUrls} from '../index.tsx'

const tabs = [
  {name: 'Muse', href: '#', current: true},
  {name: 'About', href: '#', current: false},
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                  <a
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      tab.current
                        ? 'border-blue-500 text-gray-900'
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
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInStagger faster>
            <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8 ">
              {imageUrls.map((url, index) => (
                <Fragment key={index}>
                  <FadeIn>
                    <Content content={{url}} />
                  </FadeIn>
                </Fragment>
              ))}
            </div>
          </FadeInStagger>
        </div>
      </article>
    </>
  )
}
