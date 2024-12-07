import {Header} from '@/components/layout/index.ts'
import {AccountCover} from './components/cover.tsx'
import {Footer} from '@/components/footer/index.tsx'
import {CreatorAnalytics} from './components/creator-analytics.tsx'
import {UserTimeline} from './components/timeline.tsx'
import {OtherCreators} from './components/other-creators.tsx'
import {Contents} from './components/content.tsx'
import {QuickActions} from './components/quick-actions.tsx'
import {CreatorApplicationModal} from './components/creator-application-modal/index.tsx'
import {useSearchParams} from '@remix-run/react'
import {CreatorAbout} from './components/about.tsx'
import {useAuth} from '@/providers/auth/index.tsx'

export const AccountModule = () => {
  const {currentUser} = useAuth()
  const [searchParams] = useSearchParams()

  const completeCreatorApplicationParam = searchParams.get(
    'complete-creator-application',
  )
  const isCompleteCreatorApplicationModalOpened = Boolean(
    completeCreatorApplicationParam &&
      completeCreatorApplicationParam !== 'false',
  )

  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="grid grid-cols-8 gap-3 px-4 lg:px-8 bg-gray-50 pt-4 pb-16">
        <div className="col-span-8 lg:col-span-6 flex flex-col gap-y-8">
          <AccountCover />

          {currentUser?.role === 'CREATOR' ? (
            <>
              <CreatorAbout />
              <CreatorAnalytics />
            </>
          ) : null}
          <Contents />
        </div>
        <div className="col-span-2 flex flex-col gap-y-10">
          <QuickActions />
          <UserTimeline />
          <OtherCreators />
        </div>
      </div>
      <Footer />
      <CreatorApplicationModal
        isOpened={isCompleteCreatorApplicationModalOpened}
      />
    </>
  )
}
