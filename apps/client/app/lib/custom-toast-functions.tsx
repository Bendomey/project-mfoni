import {Button} from '@/components/button/index.tsx'
import {XCircleIcon} from '@heroicons/react/24/solid'
import {AnimatePresence, motion} from 'framer-motion'
import {toast, type ToastOptions} from 'react-hot-toast'

export const successToast = (message: string, options?: ToastOptions) => {
  // remove all  other toasts
  toast.remove()

  return toast.custom(
    t => (
      <AnimatePresence>
        {t.visible ? (
          <motion.div
            initial={{y: 50, opacity: 0}}
            animate={{y: 0, opacity: 1, transition: {delay: 0}}}
            exit={{y: 50, opacity: 0}}
            transition={{ease: 'easeInOut', duration: t.duration}}
            className="pointer-events-none fixed left-0 right-0 px-5 bottom-8"
          >
            <div className="mx-auto flex w-11/12 max-w-8xl justify-end">
              <div className="bg-green-600 text-white text-inverse pointer-events-auto relative max-w-xl rounded-lg p-6 shadow-md flex items-center gap-2">
                <div className="flex w-64 items-center">{message}</div>
                <Button
                  onClick={() => toast.remove(t.id)}
                  variant="unstyled"
                  className="hover:bg-green-500 p-2 rounded-full"
                >
                  <XCircleIcon className="text-white size-7" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    ),
    {
      id: `success-toast-${message.toLowerCase().replace(/\s/g, '-')}`,
      ...options,
    },
  )
}
export const errorToast = (message: string, options?: ToastOptions) => {
  // remove all  other toasts
  toast.remove()

  return toast.custom(
    t => {
      return (
        <AnimatePresence>
          {t.visible ? (
            <motion.div
              initial={{y: 50, opacity: 0}}
              animate={{y: 0, opacity: 1, transition: {delay: 0}}}
              exit={{y: 50, opacity: 0}}
              transition={{ease: 'easeInOut', duration: t.duration}}
              className="pointer-events-none fixed left-0 right-0 px-5 bottom-8"
            >
              <div className="mx-auto flex w-11/12 max-w-8xl justify-end">
                <div className="bg-red-600 text-white text-inverse pointer-events-auto relative max-w-xl rounded-lg p-8 shadow-md flex items-center gap-2">
                  <div className="flex w-64 items-center">{message}</div>
                  <Button
                    onClick={() => toast.remove(t.id)}
                    variant="unstyled"
                    className="hover:bg-red-500 p-2 rounded-full"
                  >
                    <XCircleIcon className="text-white size-7" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      )
    },
    {
      id: `error-toast-${message.toLowerCase().replace(/\s/g, '-')}`,
      ...options,
    },
  )
}
