import { Outlet, useLoaderData } from '@remix-run/react'
import { createContext, useContext } from 'react'
import { OtherCreators } from '../home/components/other-creators.tsx'
import { AccountCover } from './components/account-cover.tsx'
import { Tabs } from './components/content-tabs.tsx'
import { Footer } from '@/components/footer/index.tsx'
import { Header } from '@/components/layout/index.ts'
import { type loader } from '@/routes/$username.ts'

const CreatorContext = createContext<EnhancedCreator | null>(null)

export function CreatorPage() {
	const data = useLoaderData<typeof loader>()

	if (!data?.creator) return null

	return (
		<CreatorContext.Provider value={data.creator as unknown as EnhancedCreator}>
			<Header isHeroSearchInVisible={false} />
			<div className="grid grid-cols-8 gap-3 bg-gray-50 px-0 pb-16 pt-4 md:px-8">
				<div className="col-span-8 flex flex-col gap-y-8 lg:col-span-6">
					<div className="mx-4 md:mx-0">
						<AccountCover data={data.creator as unknown as EnhancedCreator} />
					</div>

					<div>
						<div className="mx-4 mb-4 md:mx-0">
							<h3 className="text-base font-semibold leading-6 text-gray-900">
								Contents
							</h3>
							<div className="mt-1">
								<Tabs />
							</div>
						</div>
						<Outlet />
					</div>
				</div>
				<div className="col-span-8 mx-4 mt-10 flex flex-col gap-y-10 md:mx-0 md:mt-0 lg:col-span-2">
					<OtherCreators username={data.creator.username} />
				</div>
			</div>
			<Footer />
		</CreatorContext.Provider>
	)
}

export const useCreator = () => useContext(CreatorContext)
