import {Header} from '@/components/layout/index.ts'
import {useInView} from 'react-intersection-observer'
import {ExploreHeroSection} from './components/hero/index.tsx'
import {WebTabComponent} from './components/tabs/web.tsx'
import {FadeIn, FadeInStagger} from '@/components/animation/FadeIn.tsx'
import {Fragment} from 'react'
import {Content} from '@/components/Content/index.tsx'
import {MobileTabComponent} from './components/tabs/mobile.tsx'
import {imageUrls} from '../landing-page/index.tsx'
import {Footer} from '@/components/footer/index.tsx'

export const ExploreModule = () => {
  const {ref: heroRef, inView} = useInView({
    threshold: 0,
  })

  return (
    <div className="relative">
      <div ref={heroRef}>
        <ExploreHeroSection />
      </div>
      {inView ? null : <Header isHeroSearchInVisible={false} />}
      <div className="mx-auto  max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8 my-2 lg:my-16 px-3 sm:px-3 md:px-8">
        {/* web */}
        <div className="lg:col-span-1">
          <WebTabComponent />
        </div>
        {/* mobile */}
        <div className="col-span-1 lg:hidden">
          <MobileTabComponent />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <FadeInStagger faster>
            <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8 ">
              {imageUrls.map((url, index) => (
                <Fragment key={index}>
                  <FadeIn>
                    <Content content={{url}} showFlyout />
                  </FadeIn>
                </Fragment>
              ))}
            </div>
          </FadeInStagger>
        </div>
      </div>
      <Footer />
    </div>
  )
}
