import {Header} from '@/components/layout/index.ts'
import {AccountCover} from './components/cover.tsx'
import {ProfileAbout, ProfileMuse, ProfileVideos} from './tabs/index.ts'
import {ProfileTabList, type ProfileTab} from './components/profile-tab.tsx'
import {APP_NAME} from '@/constants/index.ts'
import {useSessionStorage} from '@/hooks/use-session-storage.ts'
import {useCallback, useMemo} from 'react'

const PROFILE_TAB_CACHE = `@${APP_NAME}-profile-tab`

const profileTabViews: Record<ProfileTab, () => JSX.Element> = {
  about: ProfileAbout,
  muse: ProfileMuse,
  videos: ProfileVideos,
}

export const AccountModule = () => {
  const [activeTab, setActiveTab] = useSessionStorage<ProfileTab>(
    PROFILE_TAB_CACHE,
    'about',
  )

  const ProfileTabView = useMemo(() => profileTabViews[activeTab], [activeTab])

  const handleSetActiveTab = useCallback(
    (tab: ProfileTab) => {
      setActiveTab(tab)
    },
    [setActiveTab],
  )

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <article>
        {/* Profile header */}
        <AccountCover />
        {/* Tabs */}
        <ProfileTabList
          selectedTab={activeTab}
          handleSetTab={handleSetActiveTab}
        />
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProfileTabView />
        </div>
      </article>
    </>
  )
}
