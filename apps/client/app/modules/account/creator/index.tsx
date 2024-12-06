import {Header} from '@/components/layout/index.ts'
import {AccountCover} from './components/account-cover.tsx'
import {Footer} from '@/components/footer/index.tsx'
import {OtherCreators} from '../home/components/other-creators.tsx'
import {Outlet} from '@remix-run/react'
import {Tabs} from './components/content-tabs.tsx'

export function CreatorPage() {
  return (
    <>
      <Header isHeroSearchInVisible={false} />
      <div className="grid grid-cols-8 gap-3 px-4 lg:px-8 bg-gray-50 pt-4 pb-16">
        <div className="col-span-8 lg:col-span-6 flex flex-col gap-y-8">
          <AccountCover />

          <div>
            <div className="mb-4">
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
        <div className="col-span-2 flex flex-col gap-y-10">
          <OtherCreators />
        </div>
      </div>
      <Footer />
    </>
  )
}
