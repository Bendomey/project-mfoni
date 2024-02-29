/* eslint-disable react/self-closing-comp */
import {type ReactNode} from 'react'

export const BackgroundContainer = ({children}: {children: ReactNode}) => {
  return (
    <div className="h-[100dvh] md:h-[100vh] lg:h-[100vh] overscroll-y-none w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2]  relative">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  )
}
