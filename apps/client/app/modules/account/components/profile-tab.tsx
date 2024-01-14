import {classNames} from '@/lib/classNames.ts'

export type ProfileTab = 'about' | 'muse' | 'videos'

export type ProfileTabListOption = {
  name: string
  value: ProfileTab
}

type Props = {
  selectedTab: ProfileTab
  handleSetTab: (tab: ProfileTab) => void
}

const tabs: ProfileTabListOption[] = [
  {name: 'About', value: 'about'},
  {name: 'Muse', value: 'muse'},
  {name: 'Videos', value: 'videos'},
]

export const ProfileTabList = ({selectedTab, handleSetTab}: Props) => {
  return (
    <div className="mt-6 sm:mt-2 2xl:mt-5">
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                onClick={() => handleSetTab(tab.value)}
                type="button"
                key={tab.name}
                className={classNames(
                  selectedTab === tab.value
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap focus:outline-none border-b-2 py-4 px-1 text-sm font-medium',
                )}
                aria-current={selectedTab === tab.value ? 'page' : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
