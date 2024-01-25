import {Header} from '@/components/layout/index.ts'
import {HeroSection} from './components/hero-section/index.tsx'
import {useInView} from 'react-intersection-observer'
import {Content} from '@/components/Content/index.tsx'
import {FadeIn, FadeInStagger} from '@/components/animation/FadeIn.tsx'
import {Fragment} from 'react'

export const imageUrls = [
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-7.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-8.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-9.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-10.jpg',
  'https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-11.jpg',
]

export const LandingPageModule = () => {
  const {ref: heroRef, inView} = useInView({
    threshold: 0,
  })

  return (
    <div className="relative">
      <div ref={heroRef}>
        <HeroSection />
      </div>
      {inView ? null : <Header isHeroSearchInVisible={false} />}
      <div className="mx-auto  max-w-8xl items-center my-10 px-3 sm:px-3 md:px-8">
        <FadeInStagger faster>
          <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8 ">
            {imageUrls.map((url, index) => (
              <Fragment key={index}>
                <FadeIn>
                  <Content content={{url}} showTooltip />
                </FadeIn>
              </Fragment>
            ))}
          </div>
        </FadeInStagger>
      </div>
    </div>
  )
}
