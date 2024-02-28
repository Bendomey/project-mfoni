import {type ReactNode, type Dispatch, type SetStateAction} from 'react'
import {AnimatePresence, motion} from 'framer-motion'

type Props = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  children: ReactNode
  className?: string
}

export const SpringModal = ({
  isOpen,
  setIsOpen,
  children,
  className = 'bg-white text-gray-800 p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden',
}: Props) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
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
