import {useNavigation} from '@remix-run/react'
import {AnimatePresence, motion} from 'framer-motion'
import {useSpinDelay} from 'spin-delay'
import {useEffect, useState} from 'react'
import {Loader} from './index.tsx'

let firstRender = true

export const RouteLoader = () => {
  const transition = useNavigation()
  const [pendingPath, setPendingPath] = useState<string | null>()
  const [message, setMessage] = useState<string | null>()
  const showLoader = useSpinDelay(Boolean(transition.state !== 'idle'), {
    delay: 400,
    minDuration: 1000,
  })

  useEffect(() => {
    if (firstRender) return
    if (transition.state === 'idle') return
    if (transition.state === 'submitting') return

    setPendingPath(transition.location.pathname)
    setMessage(null)
  }, [transition])

  useEffect(() => {
    firstRender = false
  }, [])

  return (
    <AnimatePresence>
      {showLoader ? (
        <motion.div
          initial={{y: 50, opacity: 0}}
          animate={{y: 0, opacity: 1, transition: {delay: 0}}}
          exit={{y: 50, opacity: 0}}
          transition={{ease: 'easeInOut', duration: 0.3}}
          className="pointer-events-none fixed left-0 right-0 z-[100] px-5vw bottom-8"
        >
          <div className="mx-auto flex w-11/12 max-w-8xl justify-end">
            <div className="bg-blue-600 text-inverse pointer-events-auto relative max-w-xl rounded-lg p-8 pr-14 shadow-md">
              <div className="flex w-64 items-center">
                <Loader color="fill-white" />

                <div className="ml-4 inline-grid">
                  <AnimatePresence>
                    <div className="col-start-1 row-start-1 flex overflow-hidden">
                      <motion.span
                        initial={{y: 15, opacity: 0}}
                        animate={{y: 0, opacity: 1}}
                        exit={{y: -15, opacity: 0}}
                        transition={{duration: 0.25}}
                        className="text-white flex-none"
                      >
                        Loading
                      </motion.span>
                    </div>
                  </AnimatePresence>
                  {pendingPath ? (
                    <span className="text-white truncate">
                      path: {pendingPath}
                    </span>
                  ) : null}
                  {message ? <span>{message}</span> : null}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
