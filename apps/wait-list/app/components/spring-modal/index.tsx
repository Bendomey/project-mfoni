import {type ReactNode, type Dispatch, type SetStateAction} from 'react'
import {AnimatePresence, motion} from 'framer-motion'

type Props = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  children: ReactNode
  className?: string
  canClose?: boolean
}

export const SpringModal = ({
  isOpen,
  setIsOpen,
  children,
  canClose = true,
  className = 'relative w-full max-w-xl p-6 overflow-hidden overflow-y-auto text-gray-800 bg-white rounded-lg shadow-xl cursor-default max-h-[95dvh] md:max-h-[90dvh] lg:max-h-[100vh]',
}: Props) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          onClick={canClose ? () => setIsOpen(false) : () => null}
          className="fixed inset-0 z-50 grid p-8 overflow-y-scroll cursor-pointer bg-slate-900/20 backdrop-blur place-items-center"
        >
          <motion.div
            initial={{scale: 0, rotate: '12.5deg'}}
            animate={{scale: 1, rotate: '0deg'}}
            exit={{scale: 0, rotate: '0deg'}}
            onClick={e => e.stopPropagation()}
            className={className}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
