import {PhotoGrid} from '@/components/image-slider/index.jsx'
import {BackgroundContainer} from '@/components/layout/container.tsx'
import {Header} from '@/components/layout/header.tsx'
import {MovingBorderButton} from '@/components/moving-border/index.tsx'
import {useWaitListModal} from '@/providers/walt-list-popup/index.tsx'

export const LandingPageModule = () => {
  const {handleShowWaitListForm} = useWaitListModal()

  return (
    <BackgroundContainer>
      <div className="h-[60dvh] md:h-[50vh] lg:h-[50vh] flex flex-col justify-center items-center">
        <Header />
        <div className="max-w-4xl pt-8 md:pt-0 lg:pt-0 flex flex-col justify-center items-center   mx-auto px-4">
          <h1 className="relative z-10 text-2xl md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-900 leading-8 lg:leading-tight text-center font-sans font-bold">
            The best photo gallery shared by creators in{' '}
            <strong className="text-blue-600">Ghana.</strong>
          </h1>
          <p className="text-neutral-500 max-w-lg mx-auto my-6 text-base md:text-lg  leading-7 lg:leading-8 text-center relative z-10">
            We have been working hard to bring you the best photo gallery shared
            by creators in Ghana. We hope you enjoy it!
          </p>
          <MovingBorderButton
            borderRadius="1.25rem"
            onClick={handleShowWaitListForm}
            className="bg-white text-base font-medium text-black border-gray-200 border "
          >
            Join waitlist{' '}
            <span className="pl-1" aria-hidden="true">
              &rarr;
            </span>
          </MovingBorderButton>
        </div>
      </div>
      <PhotoGrid />
    </BackgroundContainer>
  )
}
