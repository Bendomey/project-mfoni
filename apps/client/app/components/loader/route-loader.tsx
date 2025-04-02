import { useNavigation } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useSpinDelay } from 'spin-delay'
import { Loader } from './index.tsx'
import { classNames } from '@/lib/classNames.ts'

export function TopLoader() {
	let transition = useNavigation();
	let active = transition.state !== 'idle';
  
	let ref = useRef<HTMLDivElement>(null);
	let [animating, setAnimating] = useState(false);
  
	useEffect(() => {
	  if (!ref.current) return;
  
	  Promise.allSettled(
		ref.current.getAnimations().map(({ finished }) => finished),
	  ).then(() => {
		if (!active) setAnimating(false);
	  });
  
	  if (active) {
		setAnimating(true)
	  }
	}, [active]);
  
	return (
	  <div
		role="progressbar"
		aria-hidden={!active}
		aria-valuetext={active ? "Loading" : undefined}
		className="fixed inset-x-0 left-0 top-0 z-50 h-1 animate-pulse"
	  >
		<div
		  ref={ref}
		  className={classNames(
			"h-full bg-blue-600 transition-all duration-500 ease-in-out",
			transition.state === "idle" &&
			  (animating ? "w-full" : "w-0 opacity-0 transition-none"),
			transition.state === "submitting" && "w-4/12",
			transition.state === "loading" && "w-10/12",
		  )}
		/>
	  </div>
	);
  }

let firstRender = true

export const BottomLoader = () => {
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
					initial={{ y: 50, opacity: 0 }}
					animate={{ y: 0, opacity: 1, transition: { delay: 0 } }}
					exit={{ y: 50, opacity: 0 }}
					transition={{ ease: 'easeInOut', duration: 0.3 }}
					className="px-5vw pointer-events-none fixed bottom-8 left-0 right-0 z-[100]"
				>
					<div className="max-w-8xl mx-auto flex w-11/12 justify-end">
						<div className="text-inverse pointer-events-auto relative max-w-xl rounded-lg bg-blue-600 p-8 pr-14 shadow-md">
							<div className="flex w-64 items-center">
								<Loader color="fill-white" />

								<div className="ml-4 inline-grid">
									<AnimatePresence>
										<div className="col-start-1 row-start-1 flex overflow-hidden">
											<motion.span
												initial={{ y: 15, opacity: 0 }}
												animate={{ y: 0, opacity: 1 }}
												exit={{ y: -15, opacity: 0 }}
												transition={{ duration: 0.25 }}
												className="flex-none text-white"
											>
												Loading
											</motion.span>
										</div>
									</AnimatePresence>
									{pendingPath ? (
										<span className="truncate text-white">
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


export const RouteLoader = TopLoader;