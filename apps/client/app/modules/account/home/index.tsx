import { Outlet, useSearchParams } from '@remix-run/react'
import { CreatorAbout } from './components/about.tsx'
import { AccountCover } from './components/cover.tsx'
import { CreatorAnalytics } from './components/creator-analytics.tsx'
import { CreatorApplicationModal } from './components/creator-application-modal/index.tsx'
import { OtherCreators } from './components/other-creators.tsx'
import { QuickActions } from './components/quick-actions.tsx'
import { Tabs } from './components/tabs.tsx'
// import { UserTimeline } from './components/timeline.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { DEFAULT_USERNAME_FOR_FETCHING_CREATORS } from '@/constants/index.ts'
import { useAuth } from '@/providers/auth/index.tsx'

export const AccountModule = () => {
	const { currentUser } = useAuth()
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
			<div className="grid grid-cols-8 gap-3 bg-gray-50 px-0 pb-16 pt-4 lg:px-8">
				<div className="col-span-8 flex flex-col gap-y-8 lg:col-span-6">
					<div className="mx-4 md:mx-0">
						<AccountCover />
					</div>

					{currentUser?.role === 'CREATOR' ? (
						<div className="mx-4 space-y-5 md:mx-0 md:space-y-0">
							<CreatorAbout />
							<CreatorAnalytics />
						</div>
					) : null}
					<div>
						<div className="mx-4 mb-5 md:mx-0">
							<h3 className="text-base font-semibold leading-6 text-gray-900">
								Your Contents
							</h3>
							<div className="mt-1">
								<Tabs />
							</div>
						</div>
						<Outlet />
					</div>
				</div>
				<div className="col-span-8 mx-4 flex flex-col gap-y-10 md:mx-0 lg:col-span-2">
					<QuickActions />
					{/* TODO: bring this back when timeline is ready */}
					{/* <UserTimeline /> */}
					<OtherCreators
						username={
							currentUser?.creator?.username ??
							DEFAULT_USERNAME_FOR_FETCHING_CREATORS
						}
					/>
				</div>
			</div>
			<Footer />
			<CreatorApplicationModal
				isOpened={isCompleteCreatorApplicationModalOpened}
			/>
		</>
	)
}
