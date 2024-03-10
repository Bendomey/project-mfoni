/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import {useBoolean} from '@/hooks/use-boolean.ts'
import {AnimatePresence, motion} from 'framer-motion'

type Props = {
  children: React.ReactNode
  /**
   * @summary leave us undefined if you want this flyout disabled.
   */
  FlyoutContent: any
  /**
   * y - top or bottom depending on screen positioning
   * x - left or right depending on screen positioning
   * @default "x"
   */
  intendedPosition: 'x' | 'y'
  arrowColor?: string
}

export const FlyoutContainer = ({
  children,
  FlyoutContent,
  intendedPosition = 'y',
  arrowColor = 'bg-black',
}: Props) => {
  const {value: open, setValue: setOpen} = useBoolean(false)
  const [position, setPosition] = React.useState<
    'top' | 'bottom' | 'left' | 'right'
  >('bottom')

  React.useEffect(() => {
    //set initial position
    if (intendedPosition === 'x') {
      setPosition('right')
    } else {
      setPosition('bottom')
    }
  }, [])

  const showFlyout = FlyoutContent && open

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (intendedPosition === 'x') {
        const {x} = e.currentTarget.getBoundingClientRect()
        const {innerWidth} = window

        if (x > innerWidth / 2) {
          setPosition('left')
        } else {
          setPosition('right')
        }
      } else {
        const {y} = e.currentTarget.getBoundingClientRect()
        const {innerHeight} = window

        if (y > innerHeight / 2) {
          setPosition('top')
        } else {
          setPosition('bottom')
        }
      }
      setOpen(true)
    },
    [],
  )

  const flyoutPosition = React.useMemo(() => {
    switch (position) {
      case 'top':
        return `bottom-7 left-1/2`
      case 'bottom':
        return `top-7 left-1/2`
      case 'left':
        return 'right-36 top-1/2'
      case 'right':
        return 'left-36 top-1/2'
      default:
        return ''
    }
  }, [position])

  const flyoutContentContainer = React.useMemo(() => {
    switch (position) {
      case 'top':
        return 'flex-col-reverse'
      case 'bottom':
        return 'flex-col'
      case 'left':
        return 'flex-row-reverse'
      case 'right':
        return 'flex-row'
      default:
        return ''
    }
  }, [position])

  const arrowPosition = React.useMemo(() => {
    switch (position) {
      case 'top':
        return '-translate-x-1/2 -translate-y-1/2'
      case 'bottom':
        return 'translate-x-1/2 translate-y-1/2'
      case 'left':
        return '-translate-x-1/2 -translate-y-1/2'
      case 'right':
        return 'translate-x-1/2 '
      default:
        return ''
    }
  }, [position])

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit cursor-pointer"
    >
      <div className="relative text-white">{children}</div>
      <AnimatePresence>
        {showFlyout ? (
          <motion.div
            initial={{
              opacity: 0,
              x:
                intendedPosition === 'x'
                  ? position === 'left'
                    ? -15
                    : 15
                  : undefined,
              y:
                intendedPosition === 'y'
                  ? position === 'top'
                    ? -15
                    : 15
                  : undefined,
            }}
            animate={{
              opacity: 1,
              x: intendedPosition === 'x' ? 0 : undefined,
              y: intendedPosition === 'y' ? 0 : undefined,
            }}
            exit={{
              opacity: 0,
              x:
                intendedPosition === 'x'
                  ? position === 'left'
                    ? -15
                    : 15
                  : undefined,
              y:
                intendedPosition === 'y'
                  ? position === 'top'
                    ? -15
                    : 15
                  : undefined,
            }}
            style={{
              translateY: intendedPosition === 'x' ? '-50%' : undefined,
              translateX: intendedPosition === 'y' ? '-50%' : undefined,
            }}
            transition={{duration: 0.3, ease: 'easeOut'}}
            className={`absolute z-10 ${flyoutPosition} text-white  "`}
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div
              className={`flex ${flyoutContentContainer} items-center w-full`}
            >
              <div
                className={`h-4 w-4 ${arrowPosition} rotate-45 ${arrowColor}`}
              />
              <FlyoutContent />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
