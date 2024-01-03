import {Header} from '@/components/layout/index.ts'
import {SearchPhotosForMobile} from '@/components/layout/header/search-for-mobile/index.tsx'
import {SearchPhotos} from '@/components/layout/header/search/index.tsx'
import {Link} from '@remix-run/react'
import {FadeIn} from '@/components/animation/FadeIn.tsx'

export const HeroSection = () => {
  return (
    <div
      style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'left',
      }}
      className="h-[60vh] bg-gradient-to-r from-sky-500 to-indigo-500"
    >
      <Header isHeroSearchInVisible={true} />
      <FadeIn className="  px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 flex ">
            <div className="relative rounded-full px-3 py-1 text-xs md:text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Announcing visual search feature.{' '}
              <Link
                to="/blog/visual-search"
                className="font-semibold text-blue-600"
              >
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="text">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              The best photo gallery shared by creators in ghana.
            </h1>
            <div className="block md:hidden mt-5">
              <SearchPhotosForMobile />
            </div>

            <div className="hidden md:block mt-5">
              <SearchPhotos isSittingOnADarkBackground />
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
