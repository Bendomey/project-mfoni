import { XCircleIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { toast, type ToastOptions } from 'react-hot-toast'
import { Button } from '@/components/button/index.tsx'

export const successToast = (message: string, options?: ToastOptions) => {
	// remove all  other toasts
	toast.remove()

	return toast.custom(
		(t) => (
			<AnimatePresence>
				{t.visible ? (
					<motion.div
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0 } }}
						exit={{ y: 50, opacity: 0 }}
						transition={{ ease: 'easeInOut', duration: t.duration }}
						className="pointer-events-none fixed bottom-8 left-0 right-0 px-5"
					>
						<div className="max-w-8xl mx-auto flex w-11/12 justify-end">
							<div className="text-inverse pointer-events-auto relative flex max-w-xl items-center gap-2 rounded-lg bg-green-600 p-6 text-white shadow-md">
								<div className="flex w-64 items-center">{message}</div>
								<Button
									onClick={() => toast.remove(t.id)}
									variant="unstyled"
									className="rounded-full p-2 hover:bg-green-500"
								>
									<XCircleIcon className="size-7 text-white" />
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
		(t) => {
			return (
				<AnimatePresence>
					{t.visible ? (
						<motion.div
							initial={{ y: 50, opacity: 0 }}
							animate={{ y: 0, opacity: 1, transition: { delay: 0 } }}
							exit={{ y: 50, opacity: 0 }}
							transition={{ ease: 'easeInOut', duration: t.duration }}
							className="px-[5vw] pointer-events-none fixed bottom-0 right-0"
						>
							<div className="max-w-8xl mx-auto flex w-11/12 justify-end">
								<div className="text-inverse pointer-events-auto relative flex max-w-xl items-center gap-2 rounded bg-red-600 p-6 text-white shadow-md">
									<div className="flex w-64 items-center">{message}</div>
									<Button
										onClick={() => toast.remove(t.id)}
										variant="unstyled"
										className="rounded-full p-2 hover:bg-red-500"
									>
										<XCircleIcon className="size-7 text-white" />
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
