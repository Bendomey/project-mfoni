import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { type Step, Steps } from './components/steps.tsx'
import { VerifyEmailStep } from './components/verify-email-step/index.tsx'
import { VerifyPhoneStep } from './components/verify-phone-step/index.tsx'
import { WelcomeStep } from './components/welcome-step/index.tsx'
import { VerifyCreatorProvider, useVerifyCreator } from './context.tsx'
import { Button } from '@/components/button/index.tsx'
import { APP_NAME } from '@/constants/index.ts'
import { classNames } from '@/lib/classNames.ts'

const StepComponents: Record<Step, () => JSX.Element> = {
	phone: VerifyPhoneStep,
	email: VerifyEmailStep,
	welcome: WelcomeStep,
}

const steps = Object.keys(StepComponents)

const VerifyAccount = () => {
	const { activeStep } = useVerifyCreator()

	const Step = useMemo(() => StepComponents[activeStep], [activeStep])

	return (
		<div className="flex h-screen flex-1">
			<div className="relative hidden w-1/3 lg:block">
				<div className="absolute top-0 h-full w-full p-5">
					<div className="flex h-full flex-col justify-between rounded-2xl bg-zinc-50 px-7 py-5">
						<div>
							<Button
								variant="unstyled"
								isLink
								href="/"
								className="mb-5 flex w-auto flex-row items-end justify-start"
							>
								<span className="text-3xl font-extrabold text-blue-700">
									{APP_NAME.slice(0, 1)}
								</span>
								<span className="text-3xl font-extrabold text-black">
									{APP_NAME.slice(1)}
								</span>
							</Button>

							<div className="mt-20">
								<Steps activeStep={activeStep} />
							</div>
						</div>

						<div className="mb-5">
							<Button
								variant="unstyled"
								isLink
								href="/account"
								className="text-sm font-bold"
							>
								<ArrowLeftIcon className="mr-2 h-4 w-auto text-black" /> Back to
								home
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="relative flex w-2/3 flex-1 flex-col items-center justify-between px-4 py-7 sm:px-6 md:py-12 lg:flex-none lg:px-20 xl:px-24">
				<div>
					<Button
						isLink
						href="/"
						variant="unstyled"
						className="mb-10 block md:hidden"
					>
						<span className="text-3xl font-extrabold text-blue-700">
							{APP_NAME.slice(0, 1)}
						</span>
						<span className="text-3xl font-extrabold text-black">
							{APP_NAME.slice(1)}
						</span>
					</Button>
				</div>
				<div className="w-[80vw] md:w-[50vw] xl:w-[40vw]">
					<Step />
				</div>
				<div className="flex items-center justify-center">
					<div className="grid w-[50vw] grid-cols-4 gap-2 md:w-[17vw]">
						{steps.map((step, i) => (
							<div
								className={classNames(
									'w-ful h-2 rounded-lg',
									step === activeStep ? 'bg-blue-600' : 'bg-zinc-200',
								)}
								key={i}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export const VerifyAccountModule = () => {
	return (
		<VerifyCreatorProvider>
			<VerifyAccount />
		</VerifyCreatorProvider>
	)
}
