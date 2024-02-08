import {Header} from '@/components/layout/index.ts'
import {SearchPhotosForMobile} from '@/components/layout/header/search-for-mobile/index.tsx'
import {SearchPhotos} from '@/components/layout/header/search/index.tsx'
import {FadeIn} from '@/components/animation/FadeIn.tsx'
// import {motion} from 'framer-motion'
import heroBg from '@/assets/hero-bg.jpeg'
// import noise from '@/assets/noise.png'

/**
 * @TODO: testing some animation here, you can try it out :S
 * don't forget to add "overflow-hidden relative" to the parent element
 * 
 * 
const FuzzyOverlay = () => {
  return (
    <motion.div
      initial={{transform: 'translateX(-10%) translateY(-10%)'}}
      animate={{
        transform: 'translateX(10%) translateY(10%)',
      }}
      transition={{
        repeat: Infinity,
        duration: 0.2,
        ease: 'linear',
        repeatType: 'mirror',
      }}
      style={{
        backgroundImage: `url(${noise})`,
        // backgroundImage: 'url("/noise.png")',
      }}
      className="pointer-events-none absolute -inset-[100%] opacity-[15%]"
    />
  )
}

**/

export const ExploreHeroSection = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'left',
      }}
      className="h-[42vh]  bg-gradient-to-r from-sky-500 to-indigo-500"
    >
      <Header isHeroSearchInVisible={true} />
      <FadeIn className="relative  px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Photo gallery for creators & photographers.
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
      {/* <FuzzyOverlay /> */}
    </div>
  )
}
