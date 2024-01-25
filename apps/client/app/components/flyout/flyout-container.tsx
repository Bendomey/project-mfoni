import * as React from 'react'
import {useBoolean} from '@/hooks/use-boolean.ts'
import {AnimatePresence, motion} from 'framer-motion'

type Props = {
  children: React.ReactNode
  FlyoutContent: any
}

export const FlyoutContainer = ({children, FlyoutContent}: Props) => {
  const {value: open, setValue: setOpen} = useBoolean(false)

  const showFlyout = FlyoutContent && open

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit cursor-pointer"
    >
      <div className="relative text-white">
        {children}
        <span
          style={{
            transform: showFlyout ? 'scaleX(1)' : 'scaleX(0)',
          }}
          className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-indigo-300 transition-transform duration-300 ease-out"
        />
      </div>
      <AnimatePresence>
        {showFlyout ? (
          <motion.div
            initial={{opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 15}}
            style={{translateX: '-50%'}}
            transition={{duration: 0.3, ease: 'easeOut'}}
            className="absolute z-50 left-1/2 top-12 bg-black rounded-2xl text-white"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black" />
            <FlyoutContent />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
